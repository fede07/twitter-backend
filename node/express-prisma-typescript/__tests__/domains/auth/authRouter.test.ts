// import * as express from 'express';
// import { Express } from 'express';
// import { AuthService, AuthServiceImpl } from '../../../src/domains/auth/service';
// import { authRouter } from '../../../src/domains/auth';
// import { UserRepositoryImpl } from '../../../src/domains/user/repository';
// import { db } from '../../../src/utils';
// import { LoginInputDTO, SignupInputDTO, TokenDTO } from '../../../src/domains/auth/dto';
// import { request } from 'node:http';
// import HttpStatus from 'http-status';
//
// jest.mock('../../../src/domains/auth/authService',() => ({
//   AuthServiceImpl: jest.fn().mockImplementation(() => ({
//     signup: jest.fn(),
//     login: jest.fn(),
//   })),
// }))
//
// describe('Auth Router', () => {
//   let app: Express;
//   let mockSignup: (data: SignupInputDTO) => Promise<TokenDTO>;
//   let mockLogin: (data: LoginInputDTO) => Promise<TokenDTO>;
//
//   beforeAll(() => {
//     // Instantiate the mocked service
//     const mockService: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))
//     mockSignup = mockService.signup;
//     mockLogin = mockService.login;
//
//     // Setup Express app with authRouter
//     app = express();
//     app.use(express.json()); // Required for parsing JSON bodies
//     app.use('/auth', authRouter);
//   });
//
//   describe('POST /auth/signup', () => {
//     it('creates a new user and returns a token', async () => {
//       // Arrange: Mock the AuthService `signup` to return a token
//       const fakeToken = 'fake-signup-token'
//       mockSignup.mockResolvedValue(fakeToken)
//
//       const validSignupData = {
//         username: 'testuser',
//         password: 'password123',
//       };
//
//       // Act: Send a POST request
//       const response = await request(app)
//         .post('/auth/signup')
//         .send(validSignupData);
//
//       // Assert: Ensure correct HTTP status and response body
//       expect(response.status).toBe(HttpStatus.CREATED);
//       expect(response.body).toBe(fakeToken);
//       expect(mockSignup).toHaveBeenCalledWith(validSignupData);
//     });
//
//     it('returns 400 when the input is invalid', async () => {
//       const invalidSignupData = {
//         username: 'short', // For example, failing DTO validations
//       };
//
//       const response = await request(app)
//         .post('/auth/signup')
//         .send(invalidSignupData);
//
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//     });
//   });
//
//   describe('POST /auth/login', () => {
//     it('logs in a user and returns a token', async () => {
//       // Arrange: Mock the AuthService `login` to return a token
//       const fakeToken = 'fake-login-token';
//       mockLogin.mockResolvedValue(fakeToken);
//
//       const validLoginData = {
//         username: 'testuser',
//         password: 'password123',
//       };
//
//       // Act: Send the POST request
//       const response = await request(app)
//         .post('/auth/login')
//         .send(validLoginData);
//
//       // Assert: Check the HTTP status and response body
//       expect(response.status).toBe(HttpStatus.OK);
//       expect(response.body).toBe(fakeToken);
//       expect(mockLogin).toHaveBeenCalledWith(validLoginData);
//     });
//
//     it('returns 400 when the input is invalid', async () => {
//       const invalidLoginData = {
//         username: '', // Missing or invalid fields
//         password: 'pass',
//       };
//
//       const response = await request(app)
//         .post('/auth/login')
//         .send(invalidLoginData);
//
//       expect(response.status).toBe(HttpStatus.BAD_REQUEST);
//     });
//
//     it('returns 401 when login fails', async () => {
//       // Arrange: Mock the AuthService `login` to throw an error for invalid credentials
//       mockLogin.mockRejectedValue(new Error('Invalid credentials'));
//
//       const invalidLoginData = {
//         username: 'wronguser',
//         password: 'wrongpassword',
//       };
//
//       // Act: Send the POST request with incorrect credentials
//       const response = await request(app)
//         .post('/auth/login')
//         .send(invalidLoginData);
//
//       // Assert: Check the HTTP status and error message handling
//       expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
//     });
//   });
// });
