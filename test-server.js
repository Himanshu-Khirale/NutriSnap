// Quick test to verify server setup
require('dotenv').config();

console.log('Testing server setup...');

// Check environment variables
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');

// Test imports
try {
  const express = require('express');
  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { Server } = require('socket.io');
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  console.log('✓ All dependencies imported successfully');
} catch (error) {
  console.log('✗ Import error:', error.message);
}

console.log('Test complete!');

