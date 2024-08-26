# Posinet

Posinet is a comprehensive Point of Sale (POS) system designed to streamline retail and sales processes. The application features user and admin roles, secure authentication, and various functionalities to manage sales, inventory, and user accounts.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Description

Posinet is an advanced POS system tailored for businesses seeking an efficient way to manage transactions and operations. It includes features such as user and admin roles, JWT-based authentication, and a user-friendly interface for seamless interaction.

## Features

- **User and Admin Roles**: Different functionalities based on user roles.
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing.
- **Responsive Design**: Mobile-friendly and accessible layout.
- **Integration with Backend**: Communicates with the backend for data retrieval and submission.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.x or later)
- [MongoDB](https://www.mongodb.com/) (for database management)

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Susan56789/posinet.git
   cd posinet
   ```

2. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the frontend development server:
   ```bash
   npm run serve
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory and add the following environment variables:

   ```env
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_connection_string
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

## Usage

1. **Frontend**: Open your browser and navigate to `http://localhost:8080` to access the application.

2. **Backend**: The backend API will be available at `http://localhost:5000`. The API handles authentication, user management, and other server-side logic.

## API Documentation

For detailed API documentation, refer to the [API Documentation](docs/API.md) file.

## Contributing

We welcome contributions to Posinet. If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -am 'Add new feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Create a pull request with a description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or inquiries, please contact us at:

- **Email**: devnimoh@gmail.com
- **Website**: [posinet.com](https://posinet.vercel.app/)

---

Thank you for using Posinet!
