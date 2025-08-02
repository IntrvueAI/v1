# 11+ Interview Preparation Platform

A professional AI-powered platform to help students prepare for UK 11+ school entrance interviews using anam.ai's conversational AI technology.

## Features

- **AI Interview Assistant**: Realistic interview practice with an AI interviewer specialized in 11+ school admissions
- **Professional Interface**: Clean, academic design optimized for educational use
- **Real-time Interaction**: Live video conversation with AI interviewer
- **Interview Controls**: Easy start/stop functionality with status monitoring
- **Responsive Design**: Works on desktop and mobile devices
- **Educational Focus**: Age-appropriate questions for 10-11 year olds

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: anam.ai SDK for conversational AI
- **Future**: OpenAI API for feedback analysis (to be implemented)

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Anam.ai API key ([Get one here](https://dashboard.anam.ai/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 11-plus-interview-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file and add your API keys:
   VITE_ANAM_API_KEY=your_anam_api_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Configure anam.ai persona** (Important!)
   
   You need to replace the placeholder persona IDs in the code with actual IDs from your anam.ai dashboard:
   
   - Go to [anam.ai dashboard](https://dashboard.anam.ai/)
   - Create or select an avatar, voice, and LLM
   - Copy the IDs and update them in `src/hooks/useInterviewSession.ts`:
   
   ```typescript
   // Replace these placeholder IDs with your actual persona IDs:
   avatarId: "your-actual-avatar-id",
   voiceId: "your-actual-voice-id", 
   llmId: "your-actual-llm-id",
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:8080` to use the platform

## Usage

1. **Grant permissions**: Allow camera and microphone access when prompted
2. **Start interview**: Click "Start Interview" to begin the AI-powered interview session
3. **Interact naturally**: Speak clearly and answer the interviewer's questions
4. **End session**: Click "End Interview" when finished

## Important Security Note

**For Production Use**: The current setup includes API keys in environment variables for development convenience. For production deployment:

1. Create a backend API to handle anam.ai authentication
2. Move API keys to server-side environment variables
3. Implement session token generation on your backend
4. Update the frontend to call your backend API instead of anam.ai directly

Example backend endpoint structure:
```
POST /api/anam/session-token
→ Returns: { sessionToken: "..." }
```

## Configuration

### Interview Persona Customization

The AI interviewer's behavior is defined in the `systemPrompt` within `useInterviewSession.ts`. You can customize:

- Question types and topics
- Interview style and tone
- Age-appropriate content
- Subject focus areas

### Design Customization

The design system is defined in:
- `src/index.css` - Color palette and design tokens
- `tailwind.config.ts` - Tailwind configuration
- Component-specific styling in individual component files

## Development

### Project Structure

```
src/
├── components/
│   ├── InterviewPlatform.tsx    # Main platform component
│   ├── InterviewControls.tsx    # Start/stop controls
│   └── InterviewStatus.tsx      # Connection status display
├── hooks/
│   └── useInterviewSession.ts   # anam.ai integration hook
├── api/
│   └── anam.ts                  # API integration utilities
└── pages/
    └── Index.tsx                # Main page
```

### Key Components

- **InterviewPlatform**: Main container with video interface and controls
- **InterviewControls**: Professional start/stop buttons with loading states
- **InterviewStatus**: Real-time connection and session status
- **useInterviewSession**: React hook managing anam.ai SDK integration

## Troubleshooting

### Common Issues

1. **"ANAM_API_KEY not found" error**
   - Ensure you've created a `.env` file with your API key
   - Verify the key is prefixed with `VITE_` for client-side access

2. **Video not displaying**
   - Check browser permissions for camera/microphone
   - Verify your anam.ai persona IDs are correct

3. **Connection failures**
   - Confirm your anam.ai API key is valid and has sufficient credits
   - Check browser console for detailed error messages

### Debug Mode

The platform includes debug information in development mode. Check the browser console for detailed logging and the status component for technical details.

## Future Enhancements

- [ ] OpenAI integration for interview feedback
- [ ] Interview recording and playback
- [ ] Performance analytics and scoring
- [ ] Multiple interview scenarios
- [ ] Progress tracking over time
- [ ] Parent/teacher dashboard

## License

This project is created for educational purposes. Please ensure compliance with anam.ai's terms of service when using their API.

## Support

For technical issues:
1. Check the browser console for error messages
2. Verify API key configuration
3. Review anam.ai documentation: https://docs.anam.ai/
4. Check that persona IDs are correctly configured

---

Built with ❤️ for 11+ students and their families.