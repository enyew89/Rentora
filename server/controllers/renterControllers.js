const Property = require("../models/Property.js");
const Unit = require("../models/Unit.js");
const Lease = require("../models/Lease.js");
const Payment = require("../models/Payment.js");

// GET /api/renters — landlord sees all active renters across their properties
exports.getRenters = async (req, res) => {
  try {
    // 1. Find all properties belonging to this landlord
    const properties = await Property.find({ landlord: req.user._id }).select("_id").lean();
    const propertyIds = properties.map((p) => p._id);

    // 2. Find all units under those properties
    const units = await Unit.find({ property: { $in: propertyIds } }).select("_id").lean();
    const unitIds = units.map((u) => u._id);

    // 3. Find all active leases under those units
    const leases = await Lease.find({ unit: { $in: unitIds }, status: "active" })
      .populate("renter", "firstName lastName username phoneNumber")
      .populate({ path: "unit", populate: { path: "property", select: "name address" } })
      .lean();

    // 4. Batch-fetch latest payment for ALL leases at once (no N+1)
    const leaseIds = leases.map((l) => l._id);
    const now = new Date();
    const latestPayments = await Payment.find({
      lease: { $in: leaseIds },
      dueDate: { $lte: now },
    }).sort({ dueDate: -1 }).lean();

    // Index by lease ID for O(1) lookup
    const paymentByLease = {};
    for (const p of latestPayments) {
      const lid = p.lease.toString();
      if (!paymentByLease[lid]) paymentByLease[lid] = p;
    }

    const renters = leases.map((lease) => {
        const lastPayment = paymentByLease[lease._id.toString()] || null;

        return {
          _id: lease._id,
          renter: {
            _id: lease.renter._id,
            firstName: lease.renter.firstName,
            lastName: lease.renter.lastName,
            email: lease.renter.username,
            phoneNumber: lease.renter.phoneNumber,
          },
          unit: {
            _id: lease.unit._id,
            unitNumber: lease.unit.unitNumber,
            rentAmount: lease.unit.rentAmount,
            property: {
              _id: lease.unit.property._id,
              name: lease.unit.property.name,
              address: lease.unit.property.address,
            },
          },
          lease: {
            _id: lease._id,
            startDate: lease.startDate,
            monthlyRent: lease.monthlyRent,
            status: lease.status,
          },
          lastPayment: lastPayment
            ? { status: lastPayment.status, dueDate: lastPayment.dueDate }
            : null,
        };
      });

    res.json(renters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};