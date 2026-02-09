import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter à Outlook Calendar.' },
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

    // Convertir les dates ISO en format Outlook
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Préparer le body de l'événement pour Outlook
    const event = {
      subject: summary,
      body: {
        contentType: 'HTML',
        content: description || '',
      },
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Paris',
      },
      location: location ? { displayName: location } : undefined,
      attendees: attendees
        ?.filter((email: string) => email && email.includes('@'))
        .map((email: string) => ({
          emailAddress: { address: email },
          type: 'required',
        })) || [],
      isReminderOn: true,
      reminderMinutesBeforeStart: 30,
    };

    // Appel à l'API Microsoft Graph
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur Outlook:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Erreur lors de la création de l\'événement' },
        { status: response.status }
      );
    }

    const eventData = await response.json();

    return NextResponse.json({
      success: true,
      eventId: eventData.id,
      htmlLink: eventData.webLink,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'événement Outlook:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
}
