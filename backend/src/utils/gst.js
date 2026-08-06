/**
 * Centralized GST Calculation Utility for Suryodaya Farms (Backend)
 * Standard: Indian GST Regulations
 * All product selling prices are GST Inclusive (5% Total GST)
 */

export const GST_RATE = 5.0; // 5% GST
export const INTRASTATE_STATE = 'telangana';

// Indian GST State & UT Codes
export const STATE_CODES = {
  'andaman & nicobar islands': '35',
  'andhra pradesh': '37',
  'arunachal pradesh': '12',
  'assam': '18',
  'bihar': '10',
  'chandigarh': '04',
  'chhattisgarh': '22',
  'dadra & nagar haveli and daman & diu': '26',
  'delhi': '07',
  'delhi (nct)': '07',
  'goa': '30',
  'gujarat': '24',
  'haryana': '06',
  'himachal pradesh': '02',
  'jammu & kashmir': '01',
  'jharkhand': '20',
  'karnataka': '29',
  'kerala': '32',
  'ladakh': '37',
  'lakshadweep': '31',
  'madhya pradesh': '23',
  'maharashtra': '27',
  'manipur': '14',
  'meghalaya': '17',
  'mizoram': '15',
  'nagaland': '13',
  'odisha': '21',
  'puducherry': '34',
  'punjab': '03',
  'rajasthan': '08',
  'sikkim': '11',
  'tamil nadu': '33',
  'telangana': '36',
  'tripura': '16',
  'uttar pradesh': '09',
  'uttarakhand': '05',
  'west bengal': '19'
};

export const getStateCode = (stateName) => {
  if (!stateName) return '36';
  const clean = stateName.trim().toLowerCase();
  return STATE_CODES[clean] || '36';
};

/**
 * Calculates GST breakdown for a single item (GST Inclusive)
 * Formula: Taxable = Inclusive Price / 1.05
 * GST = Inclusive Price - Taxable
 */
export const calculateLineGst = (inclusivePrice, quantity = 1, shippingState = 'Telangana') => {
  const isIntrastate = (shippingState || '').trim().toLowerCase() === INTRASTATE_STATE;
  const unitPrice = Number(inclusivePrice) || 0;
  const totalPriceInclusive = Math.round(((unitPrice * quantity) + Number.EPSILON) * 100) / 100;
  
  // Extract Taxable Value from GST Inclusive Price
  const taxableAmount = Math.round(((totalPriceInclusive / 1.05) + Number.EPSILON) * 100) / 100;
  const totalGst = Math.round(((totalPriceInclusive - taxableAmount) + Number.EPSILON) * 100) / 100;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;

  if (isIntrastate) {
    cgstRate = 2.5;
    sgstRate = 2.5;
    cgstAmount = Math.round(((totalGst / 2) + Number.EPSILON) * 100) / 100;
    sgstAmount = Math.round(((totalGst - cgstAmount) + Number.EPSILON) * 100) / 100;
  } else {
    igstRate = 5.0;
    igstAmount = totalGst;
  }

  return {
    quantity,
    unitPrice,
    totalPriceInclusive,
    taxableAmount,
    totalGst,
    gstType: isIntrastate ? 'CGST_SGST' : 'IGST',
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount
  };
};

/**
 * Calculates line-by-line GST breakdown for an order
 */
export const calculateOrderGst = ({
  orderItems = [],
  shippingState = 'Telangana'
}) => {
  const isIntrastate = (shippingState || '').trim().toLowerCase() === INTRASTATE_STATE;

  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalGstSum = 0;

  const processedItems = orderItems.map((item) => {
    const price = item.price !== undefined ? item.price : (item.variant ? item.variant.price : (item.product ? item.product.price : 0));
    const qty = item.quantity || 1;
    const lineGst = calculateLineGst(price, qty, shippingState);

    totalTaxable += lineGst.taxableAmount;
    totalCgst += lineGst.cgstAmount;
    totalSgst += lineGst.sgstAmount;
    totalIgst += lineGst.igstAmount;
    totalGstSum += lineGst.totalGst;

    return {
      ...item,
      ...lineGst,
      hsnCode: item.product?.hsnCode || item.hsnCode || '1106'
    };
  });

  return {
    gstType: isIntrastate ? 'CGST_SGST' : 'IGST',
    taxableAmount: Math.round(((totalTaxable) + Number.EPSILON) * 100) / 100,
    cgstAmount: Math.round(((totalCgst) + Number.EPSILON) * 100) / 100,
    sgstAmount: Math.round(((totalSgst) + Number.EPSILON) * 100) / 100,
    igstAmount: Math.round(((totalIgst) + Number.EPSILON) * 100) / 100,
    totalGst: Math.round(((totalGstSum) + Number.EPSILON) * 100) / 100,
    gstRate: 5.0,
    stateCode: getStateCode(shippingState),
    isIntrastate,
    items: processedItems
  };
};
