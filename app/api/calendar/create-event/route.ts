import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter à Google Calendar.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { summary, description, startTime, endTime, location, attendees } = body;

    // Validation
    if (!summary || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Les champs summary, startTime et endTime sont requis' },
        { status: 400 }
      );
    }

    // Configuration OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
      refresh_token: session.refreshToken as string,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Filtrer les emails valides
    const validAttendees = attendees
      ?.filter((email: string) => email && email.includes('@'))
      .map((email: string) => ({ email }));

    // Créer l'événement
    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: startTime,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Europe/Paris',
      },
      ...(validAttendees && validAttendees.length > 0 && { attendees: validAttendees }),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 jour avant
          { method: 'popup', minutes: 30 }, // 30 minutes avant
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
}
