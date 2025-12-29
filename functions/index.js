const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch"); // Ensure you have this: npm install node-fetch@2
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// --- CONFIGURATION ---
// TODO: Move these to functions.config() for production security
const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID"; 
const RAZORPAY_KEY_SECRET = "YOUR_RAZORPAY_KEY_SECRET";

const GMAIL_EMAIL = "your-email@gmail.com"; 
const GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop"; // 16-char App Password

// PROKERALA API CREDENTIALS (get these from api.prokerala.com)
const PROKERALA_CLIENT_ID = "YOUR_PROKERALA_CLIENT_ID";
const PROKERALA_CLIENT_SECRET = "YOUR_PROKERALA_CLIENT_SECRET";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Initialize Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_APP_PASSWORD,
  },
});

// --- 1. PAYMENT: CREATE ORDER (Secure Price Calculation) ---
exports.createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { items, deliveryDetails } = req.body;
      let totalAmount = 0;
      const orderItems = [];

      // Calculate Price from Server (Prevent Tampering)
      for (const item of items) {
        const productDoc = await db.collection("products").doc(item.id).get();
        if (!productDoc.exists) throw new Error(`Product ${item.name} unavailable`);
        
        const productData = productDoc.data();
        if (productData.stock < item.quantity) throw new Error(`Insufficient stock: ${productData.name}`);

        // Add customization costs if any
        let itemPrice = Number(productData.price);
        // Add your custom logic for extra charges here if needed
        // if (item.selectedOptions?.fallPico) itemPrice += 150;

        totalAmount += itemPrice * item.quantity;

        orderItems.push({
          productId: item.id,
          name: productData.name,
          price: itemPrice,
          quantity: item.quantity,
          image: productData.featuredImageUrl || "",
          selectedOptions: item.selectedOptions || {}
        });
      }

      // Create Razorpay Order
      const options = {
        amount: totalAmount * 100, // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { email: deliveryDetails.email },
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        items: orderItems // Return secure items list to frontend
      });

    } catch (error) {
      console.error("Create Order Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// --- 2. PAYMENT: VERIFY & SAVE ORDER ---
exports.verifyPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        orderDetails 
      } = req.body;

      // Verify Signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid Payment Signature");
      }

      // Save to Firestore
      const batch = db.batch();
      const orderRef = db.collection("orders").doc(razorpay_order_id);

      batch.set(orderRef, {
        ...orderDetails,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: "Paid",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        emailSent: false
      });

      // Update Stock
      orderDetails.items.forEach((item) => {
        const productRef = db.collection("products").doc(item.productId);
        batch.update(productRef, {
          stock: admin.firestore.FieldValue.increment(-item.quantity),
        });
      });

      await batch.commit();
      res.status(200).json({ success: true, orderId: razorpay_order_id });

    } catch (error) {
      console.error("Verify Payment Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

// --- 3. EMAIL: SEND ORDER CONFIRMATION (Triggered by Database) ---
exports.sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId.toUpperCase().slice(0, 8);
    const formatPrice = (amt) => Number(amt).toLocaleString('en-IN');

    // Email Template
    const emailHtml = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <div style="border-bottom: 2px solid #B08D55; padding-bottom: 10px; margin-bottom: 20px;">
          <h2 style="color: #B08D55; margin: 0;">VISHWANATHAM</h2>
          <p style="font-size: 12px; color: #666;">Spiritual Artifacts from Kashi</p>
        </div>
        
        <h3>Namaste ${order.shippingDetails?.firstName},</h3>
        <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background: #f9f9f9; text-align: left;">
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Item</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Qty</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Price</th>
          </tr>
          ${order.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${formatPrice(item.price)}</td>
            </tr>
          `).join('')}
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <p style="font-size: 18px; font-weight: bold;">Total: ₹${formatPrice(order.totalAmount)}</p>
        </div>

        <div style="margin-top: 30px; font-size: 14px; color: #555;">
          <strong>Shipping To:</strong><br/>
          ${order.shippingDetails?.address}, ${order.shippingDetails?.city}<br/>
          ${order.shippingDetails?.state} - ${order.shippingDetails?.pincode}
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"Vishwanatham Store" <${GMAIL_EMAIL}>`,
        to: order.userEmail,
        bcc: GMAIL_EMAIL, // Admin Copy
        subject: `Order Confirmed #${orderId}`,
        html: emailHtml,
      });
      console.log(`Email sent to ${order.userEmail}`);
      return snap.ref.update({ emailSent: true });
    } catch (err) {
      console.error("Email Error:", err);
      return null;
    }
  });

// --- 4. SEO: DYNAMIC SOCIAL CARDS (WhatsApp/Insta Previews) ---
exports.serveProduct = functions.https.onRequest(async (req, res) => {
  const path = req.path.split('/');
  const productId = path[path.length - 1];

  try {
    const docSnap = await db.collection('products').doc(productId).get();
    
    if (!docSnap.exists) return res.redirect('/');
    
    const product = docSnap.data();
    const title = `${product.name} | Vishwanatham`;
    const desc = product.description ? product.description.substring(0, 150) : "Authentic Spiritual Artifacts";
    const image = product.featuredImageUrl || "https://vishwanatham.com/og-image.jpg";

    // Fetch the live index.html
    const hostingUrl = `https://${process.env.GCLOUD_PROJECT}.web.app/index.html`;
    const response = await fetch(hostingUrl);
    let html = await response.text();

    // Inject Meta Tags
    html = html
      .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
      .replace(/<meta name="description" content=".*" \/>/, `<meta name="description" content="${desc}" />`)
      .replace(/<meta property="og:title" content=".*" \/>/, `<meta property="og:title" content="${title}" />`)
      .replace(/<meta property="og:description" content=".*" \/>/, `<meta property="og:description" content="${desc}" />`)
      .replace(/<meta property="og:image" content=".*" \/>/, `<meta property="og:image" content="${image}" />`);

    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.send(html);

  } catch (error) {
    console.error("SEO Error:", error);
    res.redirect('/');
  }
});

// --- 5. ASTROLOGY: FETCH RASHI (Prokerala Proxy) ---
exports.getHoroscope = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // 1. Validate Input
      const { datetime, coordinates } = req.body; // coordinates: "lat,long"
      if (!datetime || !coordinates) {
         throw new Error("Missing datetime or coordinates");
      }

      // 2. Get Access Token (OAuth2 Client Credentials Flow)
      const tokenResponse = await fetch("https://api.prokerala.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: PROKERALA_CLIENT_ID,
          client_secret: PROKERALA_CLIENT_SECRET,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
         throw new Error("Failed to authenticate with Prokerala");
      }

      // 3. Fetch Planet Positions (Cheaper endpoint that gives Rashi/Moon Sign)
      const astroResponse = await fetch(`https://api.prokerala.com/v2/astrology/planet-position?ayanamsa=1&coordinates=${coordinates}&datetime=${datetime}`, {
        headers: { "Authorization": `Bearer ${tokenData.access_token}` },
      });

      const astroData = await astroResponse.json();
      
      // 4. Extract Moon Sign (Rashi)
      // The API returns a list of planets. We need the one named "Moon".
      const moonData = astroData.data.find(p => p.name === "Moon");
      
      if (!moonData) throw new Error("Moon data not found in response");

      // Prokerala returns "Mesha", "Vrishabha" etc.
      // We map these to our English keys if needed, or send both.
      const rashiName = moonData.rasi; 
      const rashiEnglish = moonData.rasi_en; // e.g. "Aries"

      res.status(200).json({ 
        success: true, 
        data: { 
           sign: rashiEnglish, // Use English name to match our RASHI_MAPPING keys (Aries, etc.)
           details: moonData 
        } 
      });

    } catch (error) {
      console.error("Astrology API Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});