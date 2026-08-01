import { shiprocketClient } from './shiprocket.client.js';
import { shiprocketLogger } from './shiprocket.logger.js';

/**
 * Robust date parser and calculator for Shiprocket delivery responses.
 * Follows strict priority:
 * 1. Raw date string (ISO / DD-MM-YYYY / standard format) -> converted to "Friday, 7 Aug".
 * 2. Days count -> calculated as Today + delivery_days using calendar math -> converted to "Friday, 7 Aug".
 * 3. Fallback to null (only if neither is provided by Shiprocket).
 */
export function parseShiprocketDelivery(etdRaw, daysRaw, courierName) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDate = null;
  let calculationMethod = '';

  // 1. Try parsing etdRaw as a string date
  if (etdRaw && typeof etdRaw === 'string') {
    const trimmed = etdRaw.trim();
    // Check if it's DD-MM-YYYY or DD/MM/YYYY format e.g. "07-08-2026"
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // 0-indexed month
      const year = parseInt(ddmmyyyyMatch[3], 10);
      targetDate = new Date(year, month, day);
      calculationMethod = `Parsed DD-MM-YYYY date string: "${trimmed}"`;
    } else {
      // Try standard Date parsing (YYYY-MM-DD or ISO)
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
        calculationMethod = `Parsed standard date string: "${trimmed}"`;
      }
    }
  }

  // 2. If etdRaw is numeric or not a date string, check if it's a numeric days count
  if (!targetDate && etdRaw !== null && etdRaw !== undefined && etdRaw !== '') {
    const numEtd = Number(etdRaw);
    if (!isNaN(numEtd) && numEtd > 0 && numEtd < 60) {
      targetDate = new Date(today.getTime() + Math.round(numEtd) * 24 * 60 * 60 * 1000);
      calculationMethod = `Calculated from numeric etd days count: ${numEtd}`;
    }
  }

  // 3. Try daysRaw (estimated_delivery_days, delivery_days)
  if (!targetDate && daysRaw !== null && daysRaw !== undefined && daysRaw !== '') {
    const numDays = Number(daysRaw);
    if (!isNaN(numDays) && numDays > 0) {
      targetDate = new Date(today.getTime() + Math.round(numDays) * 24 * 60 * 60 * 1000);
      calculationMethod = `Calculated from delivery_days count: ${numDays}`;
    }
  }

  // 4. If Shiprocket genuinely provided neither date nor day count
  if (!targetDate) {
    console.warn(`[SHIPROCKET EDD WARN]: Courier "${courierName}" genuinely returned neither a date nor a day count. etdRaw=${etdRaw}, daysRaw=${daysRaw}`);
    return {
      expectedDeliveryDate: null,
      expectedDeliveryDays: null,
      shortEDD: null,
      badgeType: 'STANDARD',
      badgeText: '📦 Standard Delivery',
      calculationMethod: 'Neither date nor days provided by Shiprocket'
    };
  }

  targetDate.setHours(0, 0, 0, 0);

  // Calculate actual calendar days difference from today
  const diffTime = targetDate.getTime() - today.getTime();
  const calculatedDays = Math.max(Math.round(diffTime / (1000 * 60 * 60 * 24)), 1);

  // Formatted date string (e.g. "Friday, 7 Aug")
  const weekdayFull = targetDate.toLocaleDateString('en-IN', { weekday: 'long' });
  const dayNum = targetDate.getDate();
  const monthShort = targetDate.toLocaleDateString('en-IN', { month: 'short' });
  const formattedEDD = `${weekdayFull}, ${dayNum} ${monthShort}`;

  const weekdayShort = targetDate.toLocaleDateString('en-IN', { weekday: 'short' });
  const shortEDD = `${weekdayShort}, ${dayNum} ${monthShort}`;

  // Smart delivery badge
  let badgeType = 'DELIVERY';
  let badgeText = `🚚 Delivery Expected`;

  if (calculatedDays <= 1) {
    badgeType = 'TOMORROW';
    badgeText = `⚡ Arrives Tomorrow`;
  } else if (calculatedDays === 2) {
    badgeType = 'EXPRESS';
    badgeText = `🚀 Express Delivery`;
  } else if (calculatedDays >= 3 && calculatedDays <= 4) {
    badgeType = 'STANDARD';
    badgeText = `📦 Standard Delivery`;
  } else {
    badgeType = 'DELIVERY';
    badgeText = `🚚 Delivery Expected`;
  }

  return {
    expectedDeliveryDate: formattedEDD,
    expectedDeliveryDays: calculatedDays,
    shortEDD: shortEDD,
    badgeType,
    badgeText,
    calculationMethod
  };
}

export const serviceabilityService = {
  /**
   * Calculate Available Couriers, Delivery Days, Shipping Prices, and COD Availability
   */
  async checkServiceability({
    pickupPincode = '302001',
    deliveryPincode,
    weight = 0.5,
    length = 15,
    width = 15,
    height = 10,
    cod = 0,
    declaredValue = 500
  }) {
    if (!deliveryPincode) {
      throw new Error('Delivery pincode is required for shipping serviceability check.');
    }

    try {
      const params = {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight: weight.toString(),
        cod: cod ? '1' : '0',
        length: length.toString(),
        width: width.toString(),
        height: height.toString(),
        declared_value: declaredValue.toString()
      };

      shiprocketLogger.info('SERVICEABILITY', 'Checking shipping rate & serviceability...', params);

      const response = await shiprocketClient.get('/v1/external/courier/serviceability/', { params });
      const data = response.data;

      // 1. LOG COMPLETE RAW SHIPROCKET SERVICEABILITY RESPONSE
      console.log('====================================================');
      console.log('[SHIPROCKET API COMPLETE RAW RESPONSE]:');
      console.log(JSON.stringify(data, null, 2));
      console.log('====================================================');

      if (!data || data.status !== 200 || !data.data) {
        throw new Error(data?.message || 'Failed to fetch courier serviceability.');
      }

      const availableCouriers = data.data.available_courier_companies || [];

      if (availableCouriers.length === 0) {
        return {
          isServiceable: false,
          message: 'No courier partners available for this delivery pincode.',
          couriers: [],
          cheapest: null,
          fastest: null
        };
      }

      // 2 & 3. EXHAUSTIVE FIELD EXTRACTION & NORMALIZATION
      const formattedCouriers = availableCouriers.map((c) => {
        const etdRaw = c.estimated_delivery_date || c.expected_delivery_date || c.etd || c.edd || c.expected_delivery || c.estimated_delivery || c.etd_date || null;
        const daysRaw = c.estimated_delivery_days ?? c.delivery_days ?? c.etd_days ?? c.expected_delivery_days ?? c.days ?? null;

        const cleanCourierName = (c.courier_name || '')
          .replace(/\s+(Air|Surface|Express|Standard|Cod|Surface\s+2kg|Surface\s+1kg|5kg|10kg|20kg)$/i, '')
          .trim() || c.courier_name;

        const shippingCharge = parseFloat(c.rate) || 0;

        const deliveryInfo = parseShiprocketDelivery(etdRaw, daysRaw, cleanCourierName);

        // 8. MANDATORY BACKEND DEBUG LOGS FOR VERIFICATION
        console.log(`Courier: ${cleanCourierName}`);
        console.log(`Delivery Days: ${deliveryInfo.expectedDeliveryDays ?? 'N/A (Raw: ' + daysRaw + ')'}`);
        console.log(`Delivery Date: ${etdRaw ?? 'N/A'}`);
        console.log(`Calculated Date: ${deliveryInfo.expectedDeliveryDate ?? 'Fallback (3–5 Business Days)'}`);
        console.log(`Method: ${deliveryInfo.calculationMethod}`);
        console.log('----------------------------------------------------');

        return {
          courierCompanyId: c.courier_company_id,
          courierName: cleanCourierName,
          rawCourierName: c.courier_name,
          shippingCharge,
          rate: shippingCharge,
          freightCharge: parseFloat(c.freight_charge) || shippingCharge,
          expectedDeliveryDate: deliveryInfo.expectedDeliveryDate,
          expectedDeliveryDays: deliveryInfo.expectedDeliveryDays,
          formattedEDD: deliveryInfo.expectedDeliveryDate,
          shortEDD: deliveryInfo.shortEDD,
          badgeType: deliveryInfo.badgeType,
          badgeText: deliveryInfo.badgeText,
          courierRating: c.rating || 4.5
        };
      });

      // Sort to identify cheapest and fastest options
      const sortedByPrice = [...formattedCouriers].sort((a, b) => a.shippingCharge - b.shippingCharge);
      const sortedBySpeed = [...formattedCouriers].sort((a, b) => (a.expectedDeliveryDays || 99) - (b.expectedDeliveryDays || 99));

      const cheapest = sortedByPrice[0] ? { ...sortedByPrice[0], tag: 'CHEAPEST' } : null;
      const fastest = sortedBySpeed[0] ? { ...sortedBySpeed[0], tag: 'FASTEST' } : null;

      const finalResponsePayload = {
        isServiceable: true,
        recommendedCourier: cheapest,
        cheapest,
        fastest,
        couriers: formattedCouriers
      };

      // 9. LOG FINAL RESPONSE SENT TO FRONTEND
      console.log('====================================================');
      console.log('[SHIPROCKET CONTROLLER FINAL PAYLOAD SENT TO FRONTEND]:');
      console.log(JSON.stringify(finalResponsePayload, null, 2));
      console.log('====================================================');

      return finalResponsePayload;
    } catch (err) {
      shiprocketLogger.error('SERVICEABILITY', 'Error checking serviceability', err);
      throw err;
    }
  },

  /**
   * Get Estimated Delivery Window
   */
  async getEstimatedDelivery({ pickupPincode = '302001', deliveryPincode, weight = 0.5 }) {
    const res = await this.checkServiceability({
      pickupPincode,
      deliveryPincode,
      weight,
      cod: 0
    });

    if (!res.isServiceable || !res.recommendedCourier) {
      return {
        isDeliverable: false,
        deliveryMessage: 'Delivery not available to this pincode'
      };
    }

    const c = res.recommendedCourier;
    return {
      isDeliverable: true,
      courierName: c.courierName,
      shippingCharge: c.shippingCharge,
      expectedDeliveryDate: c.expectedDeliveryDate,
      expectedDeliveryDays: c.expectedDeliveryDays,
      badgeText: c.badgeText
    };
  }
};
