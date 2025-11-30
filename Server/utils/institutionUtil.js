import Institution from "../models/institution/institution.js";

/**
 * Generate a unique 7-character institution ID
 * @param {String} institutionName - Name of the institution
 * @param {Model} InstitutionModel - Mongoose Institution model
 * @returns {Promise<String>} Unique institution ID
 */
export const createInstitutionId = async (institutionName) => {
  // Extract first 4 alphabetic characters from institution name
  const alphabeticOnly = institutionName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  
  // Get first 4 letters, pad with 'X' if name is too short
  const letters = alphabeticOnly.substring(0, 4).padEnd(4, 'X');
  
  let institutionId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  // Keep generating until we find a unique ID
  while (!isUnique && attempts < maxAttempts) {
    // Generate 3 random digits (100-999)
    const randomDigits = Math.floor(Math.random() * 900) + 100;
    
    // Combine: 4 letters + 3 digits
    institutionId = `${letters}${randomDigits}`;
    
    // Check if this ID already exists in database
    const existingInstitution = await Institution.findOne({ institutionId });
    
    if (!existingInstitution) {
      isUnique = true;
    }
    
    attempts++;
  }
  
  // If we couldn't find a unique ID after max attempts, throw error
  if (!isUnique) {
    throw new Error('Unable to generate unique institution ID. Please try again.');
  }
  
  return institutionId;
};