const supertest = require('supertest');
const { app } = require('../App');
const request = supertest(app);
const mongoose = require("mongoose")
const patientModel = require("../models/PatientModel");
const RecordModel = require("../models/RecordModel.js");
const { connectDB, disconnectDB } = require('../database');

process.env.NODE_ENV = 'test';


describe('Patient API Tests', () => {

  beforeAll(() => {
    connectDB();   // Get database connection
  });

  afterAll(() => {
    disconnectDB();   // close database connection
  });

  it('should return patients data by Id', async () => { 
      var currentPatient = new patientModel({
          _id: "637ac0a5d804cb92a6b1d80d",
          fullName: "Abraham Alfred Babu",
          age: "13",
          address: "48 Scarboro Ave",
      });
      const res = await request.get('/patient/' + currentPatient._id);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe("637ac0a5d804cb92a6b1d80d");
      expect(res.body.data.fullName).toBe("Abraham Alfred Babu");
      expect(res.body.data.age).toBe("13");
      expect(res.body.data.address).toBe("48 Scarboro Ave");
  });

  it('should return all patients data', async () => {
      const res = await request.get('/patients');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
  });


  it('should validate request before adding patient with missing full name field', async () => {
    var inputRequest = {
      "patient_id": "10012",
      "fullName": "",                       // missing input field
      "age": "36",
      "address": "298 Saitama, New Jersey",
      "dob": "22-11-1985",
      "phoneNumber": "7854564968",
      "image": "image-sample"
    };
    const res = await request.post('/patient').send(inputRequest);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("fullName is required");
  });

  it('should validate request for adding patient with missing age field', async () => {
    var inputRequest = {
      "patient_id": "10012",
      "fullName": "Simone Shek",
      "age": "",                              // missing input field
      "address": "298 Saitama, New Jersey",
      "dob": "22-11-1985",
      "phoneNumber": "7854564968",
      "image": "image-sample"
    };
    const res = await request.post('/patient').send(inputRequest);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid age or age not given");
  });

  it('should validate request for adding patient with invalid phone number field', async () => {
    var inputRequest = {
      "patient_id": "10012",
      "fullName": "Simone Shek",
      "age": "32",                              
      "address": "298 Saitama, New Jersey",
      "dob": "22-11-1985",
      "phoneNumber": "785456496",          // phone number less than 10 digits
      "image": "image-sample"
    };
    const res = await request.post('/patient').send(inputRequest);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("invalid phone number");
  });

  // Records API tests below

  it('should return record by Id', async () => { 
    var currentRecord = new RecordModel({
        _id: "637ac4f3d804cb92a6b1d828",
        bloodPressure: "100",
        respirationRate: "14",
        bloodOxygen: "90",
        heartBeat: "75"
    });
      const res = await request.get('/record/' + currentRecord._id);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe("637ac4f3d804cb92a6b1d828");
      expect(res.body.data.bloodPressure).toBe("100");
      expect(res.body.data.respirationRate).toBe("14");
      expect(res.body.data.bloodOxygen).toBe("90");
      expect(res.body.data.heartBeat).toBe("75");
  });

  it('should return all records', async () => {
      const res = await request.get('/records');
      expect(res.status).toBe(200);
      expect(res.text.length).toBeGreaterThan(0);
    
  });


  it('should validate request before adding record with missing full name field', async () => {
    var inputRequest = {
        "patient_id":"10001",
        "time":"10.05",
        "bloodPressure":"",  // missing input field
        "respirationRate":"20",
        "bloodOxygen":"95",
        "heartBeat":"61"
    };
    const res = await request.post('/record').send(inputRequest);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All the details needs to be filled");
  });

  it('should validate request for adding record with missing age field', async () => {
    var inputRequest = {
        "patient_id":"10001",
        "time":"10.05",
        "bloodPressure":"100",
        "respirationRate":"",  // missing input field
        "bloodOxygen":"95",
        "heartBeat":"61"
    };
    const res = await request.post('/record').send(inputRequest);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All the details needs to be filled");
  });
    
});