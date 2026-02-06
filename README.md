# Kredello - PDF Credit Card Statement Analysis

A modern web application that analyzes credit card bill statements (PDFs) by categorizing spending and allowing custom date range selection. Built with React, Node.js, and integrated with Parsio's AI for PDF parsing.

## Features

- **PDF Upload & Processing**: Upload credit card statements and extract transaction data
- **Smart Categorization**: AI-powered categorization of spending with customizable categories
- **Date Range Analysis**: Filter transactions by custom date ranges
- **Interactive Visualizations**: Pie charts and sortable transaction tables
- **Dark/Light Mode**: Modern UI with theme toggle
- **CSV Export**: Download analysis results as CSV files
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- **React** (via CDN) - UI components and state management
- **Tailwind CSS** - Styling and responsive design
- **Chart.js** - Interactive data visualizations
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Inter)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web server and API
- **Multer** - File upload handling
- **Axios** - HTTP client for API calls
- **Supabase** - Database for user categories
- **Parsio API** - PDF parsing and data extraction

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for production)
- Parsio API key (for production)

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd /path/to/kredello

# Install backend dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your credentials:

```env
# Server Configuration
PORT=3000

# Supabase Configuration (for production)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Parsio API Configuration (for production)
PARSIO_API_KEY=your_parsio_api_key_here

# Environment
NODE_ENV=development
```

### 3. Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

### 4. Open the Application

Open the HTML files in your browser:

1. **Homepage**: `kredello.html` - Upload PDF statements
2. **Analysis**: `kredello-analysis.html` - Configure date range and categories
3. **Results**: `kredello-results.html` - View spending insights

## API Endpoints

### POST `/upload`
Upload PDF files for processing
- **Body**: `multipart/form-data` with PDF file
- **Response**: Success message with transaction count

### POST `/analyze`
Process transactions with date range and categories
- **Body**: `{ startDate, endDate, categories }`
- **Response**: Analysis results

### GET `/results`
Retrieve analysis results
- **Response**: `{ summary, transactions, totalSpending, transactionCount }`

### GET `/export`
Download results as CSV
- **Response**: CSV file download

### GET `/health`
Health check endpoint
- **Response**: Server status

## File Structure

```
kredello/
├── server.js              # Express backend server
├── package.json           # Node.js dependencies
├── env.example           # Environment variables template
├── README.md             # This file
├── kredello.html         # Homepage (upload)
├── kredello-analysis.html # Analysis page
└── kredello-results.html # Results page
```

## Usage Workflow

1. **Upload PDFs**: Open `kredello.html` and upload credit card statements
2. **Configure Analysis**: Set date range and select categories on analysis page
3. **View Results**: See spending breakdown with charts and tables
4. **Export Data**: Download results as CSV for further analysis

## Development Notes

### Mock Data Mode
The application currently uses mock data for demonstration. To integrate with real APIs:

1. **Parsio Integration**: Replace mock data in `server.js` with actual Parsio API calls
2. **Supabase Integration**: Uncomment Supabase code for production category storage
3. **Environment Variables**: Set up real API keys in `.env`

### Production Deployment

1. **Environment Variables**: Set production values in `.env`
2. **HTTPS**: Enable HTTPS for secure file uploads
3. **File Storage**: Implement proper file storage (AWS S3, etc.)
4. **Database**: Use Supabase for persistent category storage
5. **Error Handling**: Add comprehensive error handling and logging

## API Integration

### Parsio API (Bank Statement Model)
```javascript
// Example Parsio integration
const response = await axios.post(`${PARSIO_BASE_URL}/v1/parse`, {
  mailbox_id: mailboxId,
  model: 'bank-statement',
  file_id: fileId
});
```

### Supabase Integration
```javascript
// Store user categories
const { data, error } = await supabase
  .from('categories')
  .insert([{ user_id: userId, category_name: categoryName, keywords }]);
```

## Category Keywords

The system uses keyword matching for automatic categorization:

- **Groceries**: walmart, kroger, target, safeway, whole foods
- **Dining Out**: starbucks, mcdonalds, chipotle, subway
- **Food Delivery**: uber eats, doordash, grubhub
- **Utilities**: electric, gas, water, internet, phone
- **Entertainment**: netflix, spotify, amazon prime, hulu
- **Transportation**: uber, lyft, taxi, gas station
- **Shopping**: amazon, ebay, etsy, best buy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Check the console for error messages
- Verify environment variables are set correctly
- Ensure the backend server is running on port 3000
- Check browser network tab for API call failures # carbon.protocol
