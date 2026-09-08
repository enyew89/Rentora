const Property = require("../models/Property.js");
const Unit = require("../models/Unit.js");
const Lease = require("../models/Lease.js");
const Payment = require("../models/Payment.js");

// GET /api/renters — landlord sees all active renters across their properties
exports.getRenters = async (req, res) => {
  try {
    // 1. Find all properties belonging to this landlord
    const properties = await Property.find({ landlord: req.user._id }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    // 2. Find all units under those properties
    const units = await Unit.find({ property: { $in: propertyIds } }).select("_id");
    const unitIds = units.map((u) => u._id);

    // 3. Find all active leases under those units
    const leases = await Lease.find({ unit: { $in: unitIds }, status: "active" })
      .populate("renter", "firstName lastName username phoneNumber")
      .populate({ path: "unit", populate: { path: "property", select: "name address" } });

    // 4. For each lease, find the most recent payment (current month or earlier)
    const now = new Date();

    const renters = await Promise.all(
      leases.map(async (lease) => {
        const lastPayment = await Payment.findOne({
          lease: lease._id,
          dueDate: { $lte: now },
        }).sort({ dueDate: -1 });

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
      })
    );

    res.json(renters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};