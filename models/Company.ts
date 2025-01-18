import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: true
  },
  technologyStack: [{
    type: String,
    required: true
  }],
  targetMarket: [{
    type: String,
    required: true
  }],
  geographicPresence: [{
    type: String,
    required: true
  }],
  serviceOfferings: [{
    type: String,
    required: true
  }],
  industry: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
companySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
