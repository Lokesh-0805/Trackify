const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('../models/Company');
const User = require('../models/User');
const FeedbackParameter = require('../models/FeedbackParameter');
const FeedbackCycle = require('../models/FeedbackCycle');
const FeedbackAssignment = require('../models/FeedbackAssignment');
const Feedback = require('../models/Feedback');
const FeedbackItem = require('../models/FeedbackItem');

dotenv.config();

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding');

  const collectionsToClear = [
    'feedbackitems',
    'feedbacks',
    'feedbackassignments',
    'feedbackcycles',
    'feedbackparameters',
    'users',
    'companies',
  ];

  for (const collectionName of collectionsToClear) {
    try {
      await mongoose.connection.collection(collectionName).deleteMany({});
    } catch (error) {
      console.warn(`Could not clear ${collectionName}:`, error.message);
    }
  }

  const ashokaCompany = await Company.create({ name: 'Ashoka Textiles' });
  const brightPathCompany = await Company.create({ name: 'Bright Path Consulting' });

  const parameterNames = [
    'Ownership',
    'Communication',
    'Quality of Work',
    'Teamwork',
    'Problem Solving',
  ];

  const parameters = await FeedbackParameter.insertMany(
    parameterNames.map((name) => ({
      name,
      description: `Parameter for ${name}`,
      active: true,
    }))
  );

  const createUser = async ({ companyId, name, email, password, role = 'EMPLOYEE', managerId = null }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return User.create({
      companyId,
      name,
      email,
      password: hashedPassword,
      role,
      managerId,
    });
  };

  const ashokaUsers = {};
  const brightPathUsers = {};

  ashokaUsers['COO'] = await createUser({
    companyId: ashokaCompany._id,
    name: 'COO',
    email: 'coo@ashoka.test',
    password: 'Ashoka123!',
    role: 'EMPLOYEE',
  });

  ashokaUsers['Rohan'] = await createUser({
    companyId: ashokaCompany._id,
    name: 'Rohan',
    email: 'rohan@ashoka.test',
    password: 'Ashoka123!',
    role: 'EMPLOYEE',
    managerId: ashokaUsers['COO']._id,
  });

  ashokaUsers['Priya'] = await createUser({
    companyId: ashokaCompany._id,
    name: 'Priya',
    email: 'priya@ashoka.test',
    password: 'Ashoka123!',
    role: 'EMPLOYEE',
    managerId: ashokaUsers['Rohan']._id,
  });

  const ashokaDirectReports = ['Rahul', 'Aman', 'Neha', 'Karan', 'Simran', 'Arjun'];
  for (const name of ashokaDirectReports) {
    ashokaUsers[name] = await createUser({
      companyId: ashokaCompany._id,
      name,
      email: `${name.toLowerCase()}@ashoka.test`,
      password: 'Ashoka123!',
      role: 'EMPLOYEE',
      managerId: ashokaUsers['Priya']._id,
    });
  }

  ashokaUsers['HR'] = await createUser({
    companyId: ashokaCompany._id,
    name: 'Ashoka HR',
    email: 'hr@ashoka.test',
    password: 'Ashoka123!',
    role: 'HR',
    managerId: null,
  });

  brightPathUsers['Founder'] = await createUser({
    companyId: brightPathCompany._id,
    name: 'Founder',
    email: 'founder@brightpath.test',
    password: 'Bright123!',
    role: 'EMPLOYEE',
  });

  for (let index = 1; index <= 8; index += 1) {
    const name = `Employee ${index}`;
    brightPathUsers[name] = await createUser({
      companyId: brightPathCompany._id,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@brightpath.test`,
      password: 'Bright123!',
      role: 'EMPLOYEE',
      managerId: brightPathUsers['Founder']._id,
    });
  }

  brightPathUsers['HR'] = await createUser({
    companyId: brightPathCompany._id,
    name: 'Bright Path HR',
    email: 'hr@brightpath.test',
    password: 'Bright123!',
    role: 'HR',
    managerId: null,
  });

  const ashokaCycle = await FeedbackCycle.create({
    companyId: ashokaCompany._id,
    month: 8,
    year: 2026,
    status: 'OPEN',
  });

  const brightPathCycle = await FeedbackCycle.create({
    companyId: brightPathCompany._id,
    month: 8,
    year: 2026,
    status: 'OPEN',
  });

  const createAssignmentsForCompany = async ({ companyId, reviewer, reviewees, cycleId }) => {
    const assignments = [];
    for (const reviewee of reviewees) {
      const assignment = await FeedbackAssignment.create({
        companyId,
        cycleId,
        reviewerId: reviewer._id,
        revieweeId: reviewee._id,
        status: 'PENDING',
      });
      assignments.push(assignment);
    }
    return assignments;
  };

  const ashokaAssignments = [];
  ashokaAssignments.push(...await createAssignmentsForCompany({
    companyId: ashokaCompany._id,
    reviewer: ashokaUsers['Rohan'],
    reviewees: [ashokaUsers['Priya']],
    cycleId: ashokaCycle._id,
  }));

  ashokaAssignments.push(...await createAssignmentsForCompany({
    companyId: ashokaCompany._id,
    reviewer: ashokaUsers['Priya'],
    reviewees: [ashokaUsers['Rahul'], ashokaUsers['Aman'], ashokaUsers['Neha'], ashokaUsers['Karan'], ashokaUsers['Simran'], ashokaUsers['Arjun']],
    cycleId: ashokaCycle._id,
  }));

  const brightPathAssignments = [];
  brightPathAssignments.push(...await createAssignmentsForCompany({
    companyId: brightPathCompany._id,
    reviewer: brightPathUsers['Founder'],
    reviewees: [brightPathUsers['Employee 1'], brightPathUsers['Employee 2'], brightPathUsers['Employee 3'], brightPathUsers['Employee 4'], brightPathUsers['Employee 5'], brightPathUsers['Employee 6'], brightPathUsers['Employee 7'], brightPathUsers['Employee 8']],
    cycleId: brightPathCycle._id,
  }));

  const sampleScores = [5, 4, 3, 2, 1];
  const sampleComments = [
    'Consistently delivered strong results and showed ownership.',
    'Communicated clearly and supported the team well.',
    'Quality of work was strong and thoughtful.',
    'Worked well with peers and improved collaboration.',
    'Showed solid problem solving under pressure.',
  ];

  const createFeedbackForAssignment = async (assignment, reviewerName, revieweeName) => {
    const feedback = await Feedback.create({
      assignmentId: assignment._id,
      companyId: assignment.companyId,
      cycleId: assignment.cycleId,
      reviewerId: assignment.reviewerId,
      revieweeId: assignment.revieweeId,
      submittedAt: new Date(),
    });

    const items = parameters.map((parameter, index) => ({
      feedbackId: feedback._id,
      parameterId: parameter._id,
      score: sampleScores[index % sampleScores.length],
      comment: `${reviewerName} noted ${revieweeName} performed well in ${parameter.name}. ${sampleComments[index % sampleComments.length]}`,
    }));

    await FeedbackItem.insertMany(items);
  };

  const ashokaSubmittedAssignments = ashokaAssignments.filter((assignment) => assignment.reviewerId.toString() === ashokaUsers['Priya']._id.toString()).slice(0, 4);
  for (const assignment of ashokaSubmittedAssignments) {
    await FeedbackAssignment.findByIdAndUpdate(assignment._id, { status: 'SUBMITTED', submittedAt: new Date() });
    await createFeedbackForAssignment(assignment, 'Priya', assignment.revieweeId.toString());
  }

  const rohanAssignment = ashokaAssignments.find((assignment) => assignment.reviewerId.toString() === ashokaUsers['Rohan']._id.toString() && assignment.revieweeId.toString() === ashokaUsers['Priya']._id.toString());
  if (rohanAssignment) {
    await FeedbackAssignment.findByIdAndUpdate(rohanAssignment._id, { status: 'SUBMITTED', submittedAt: new Date() });
    await createFeedbackForAssignment(rohanAssignment, 'Rohan', 'Priya');
  }

  const priyaPendingAssignments = ashokaAssignments.filter((assignment) => assignment.reviewerId.toString() === ashokaUsers['Priya']._id.toString() && assignment.status === 'PENDING').slice(0, 2);
  for (const assignment of priyaPendingAssignments) {
    await FeedbackAssignment.findByIdAndUpdate(assignment._id, { status: 'PENDING' });
  }

  const brightPathSubmittedAssignments = brightPathAssignments.slice(0, 4);
  for (const assignment of brightPathSubmittedAssignments) {
    await FeedbackAssignment.findByIdAndUpdate(assignment._id, { status: 'SUBMITTED', submittedAt: new Date() });
    await createFeedbackForAssignment(assignment, 'Founder', assignment.revieweeId.toString());
  }

  const brightPathPendingAssignments = brightPathAssignments.slice(4);
  for (const assignment of brightPathPendingAssignments) {
    await FeedbackAssignment.findByIdAndUpdate(assignment._id, { status: 'PENDING' });
  }

  const seededCredentials = [
    { role: 'Ashoka HR', email: 'hr@ashoka.test', password: 'Ashoka123!' },
    { role: 'Bright Path HR', email: 'hr@brightpath.test', password: 'Bright123!' },
    { role: 'Priya', email: 'priya@ashoka.test', password: 'Ashoka123!' },
    { role: 'Rohan', email: 'rohan@ashoka.test', password: 'Ashoka123!' },
    { role: 'Founder', email: 'founder@brightpath.test', password: 'Bright123!' },
    { role: 'Employee', email: 'employee1@brightpath.test', password: 'Bright123!' },
  ];

  console.log('\nSeed completed successfully');
  console.log('Test credentials:');
  seededCredentials.forEach((credential) => {
    console.log(`${credential.role}: ${credential.email} / ${credential.password}`);
  });

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
