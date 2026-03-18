import { PurchaseOrderData, PurchaseOrderItem } from '../types';

export function parseNFeXML(xmlString: string): Partial<PurchaseOrderData> | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
      console.error("XML Parsing Error", parserError[0].textContent);
      return null;
    }

    // Extract Vendor (Proponente Vencedor)
    const emit = xmlDoc.getElementsByTagName("emit")[0];
    const winnerProponent = emit?.getElementsByTagName("xNome")[0]?.textContent || "";

    // Extract Items
    const detElements = xmlDoc.getElementsByTagName("det");
    const items: PurchaseOrderItem[] = [];
    let totalAmount = 0;

    for (let i = 0; i < detElements.length; i++) {
      const det = detElements[i];
      const prod = det.getElementsByTagName("prod")[0];
      
      const description = prod.getElementsByTagName("xProd")[0]?.textContent || "";
      const unit = prod.getElementsByTagName("uCom")[0]?.textContent || "";
      const quantity = parseFloat(prod.getElementsByTagName("qCom")[0]?.textContent || "0");
      const unitPrice = parseFloat(prod.getElementsByTagName("vUnCom")[0]?.textContent || "0");
      const totalPrice = parseFloat(prod.getElementsByTagName("vProd")[0]?.textContent || "0");

      items.push({
        id: i + 1,
        description,
        unit,
        quantity,
        unitPrice,
        totalPrice
      });
      
      totalAmount += totalPrice;
    }

    // Extract Date (dhEmi or dEmi)
    const ide = xmlDoc.getElementsByTagName("ide")[0];
    let date = "";
    const dhEmi = ide?.getElementsByTagName("dhEmi")[0]?.textContent;
    const dEmi = ide?.getElementsByTagName("dEmi")[0]?.textContent;
    
    if (dhEmi) {
      // Format: 2023-02-06T...
      const dateObj = new Date(dhEmi);
      date = dateObj.toLocaleDateString('pt-BR');
    } else if (dEmi) {
      // Format: 2023-02-06
      const [y, m, d] = dEmi.split('-');
      date = `${d}/${m}/${y}`;
    } else {
      date = new Date().toLocaleDateString('pt-BR');
    }

    return {
      winnerProponent,
      items,
      totalAmount,
      date,
      year: date.split('/')[2] || new Date().getFullYear().toString(),
      researchNumber: "001",
      contractor: "Conselho Escolar da U. E. Dr. João Carvalho", // Default from image
      responsibleName: "Wanderlan Lauerty do Vale", // Default from image
      responsibleRole: "Presidente", // Default from image
      location: "Dom Expedito Lopes", // Default from image
      type: 'PACTUE'
    };
  } catch (error) {
    console.error("Error parsing XML:", error);
    return null;
  }
}
