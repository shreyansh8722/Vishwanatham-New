import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const verifyStock = async (cartItems) => {
  const items = Array.isArray(cartItems) ? cartItems : [cartItems];
  for (const item of items) {
    try {
      const docSnap = await getDoc(doc(db, "products", item.id));
      if (!docSnap.exists()) return { valid: false, error: `Item "${item.name}" is no longer available.` };
      
      const realStock = docSnap.data().stock || 0;
      if (realStock < item.quantity) {
        return { valid: false, error: `Sorry, "${item.name}" is out of stock.` };
      }
    } catch (e) {
      return { valid: false, error: "System error. Please try again." };
    }
  }
  return { valid: true };
};