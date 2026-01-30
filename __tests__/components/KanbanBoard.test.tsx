import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanBoard } from '@/components/KanbanBoard'
import { Prospect } from '@/types'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

const mockProspects: Prospect[] = [
  {
    id: '1',
    nom: 'John Doe',
    entreprise: 'Acme Corp',
    email: 'john@acme.com',
    telephone: '0123456789',
    adresse: '123 Main St',
    status: 'nouveau',
    valeurEstimee: 10000,
    dateCreation: '2026-01-01T00:00:00.000Z',
    interactions: [],
  },
  {
    id: '2',
    nom: 'Jane Smith',
    entreprise: 'Tech Inc',
    email: 'jane@tech.com',
    telephone: '0987654321',
    adresse: '456 Oak Ave',
    status: 'contact',
    valeurEstimee: 20000,
    dateCreation: '2026-01-15T00:00:00.000Z',
    interactions: [],
  },
  {
    id: '3',
    nom: 'Bob Johnson',
    entreprise: 'NewCo',
    email: 'bob@newco.com',
    telephone: '1234567890',
    adresse: '789 Pine St',
    status: 'conclu',
    valeurEstimee: 30000,
    dateCreation: '2026-01-20T00:00:00.000Z',
    interactions: [],
  },
]

describe('KanbanBoard', () => {
  it('affiche toutes les colonnes de statut', () => {
    const mockUpdateStatus = jest.fn()
    const mockDelete = jest.fn()

    render(
      <KanbanBoard
        prospects={mockProspects}
        onUpdateStatus={mockUpdateStatus}
        onDelete={mockDelete}
      />
    )

    expect(screen.getByText('Nouveau')).toBeInTheDocument()
    expect(screen.getByText('Contact établi')).toBeInTheDocument()
    expect(screen.getByText('Qualification')).toBeInTheDocument()
    expect(screen.getByText('Proposition')).toBeInTheDocument()
    expect(screen.getByText('Négociation')).toBeInTheDocument()
    expect(screen.getByText('Conclu')).toBeInTheDocument()
    expect(screen.getByText('Perdu')).toBeInTheDocument()
  })

  it('affiche les prospects dans les bonnes colonnes', () => {
    const mockUpdateStatus = jest.fn()
    const mockDelete = jest.fn()

    render(
      <KanbanBoard
        prospects={mockProspects}
        onUpdateStatus={mockUpdateStatus}
        onDelete={mockDelete}
      />
    )

    // Check that prospects appear in their respective columns
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('affiche le compteur de prospects par colonne', () => {
    const mockUpdateStatus = jest.fn()
    const mockDelete = jest.fn()

    render(
      <KanbanBoard
        prospects={mockProspects}
        onUpdateStatus={mockUpdateStatus}
        onDelete={mockDelete}
      />
    )

    // Each status column should show the count
    const nouveauHeader = screen.getByText('Nouveau').parentElement
    expect(nouveauHeader).toHaveTextContent('1')

    const contactHeader = screen.getByText('Contact établi').parentElement
    expect(contactHeader).toHaveTextContent('1')

    const concluHeader = screen.getByText('Conclu').parentElement
    expect(concluHeader).toHaveTextContent('1')
  })

  it('affiche un message quand une colonne est vide', () => {
    const mockUpdateStatus = jest.fn()
    const mockDelete = jest.fn()

    render(
      <KanbanBoard
        prospects={mockProspects}
        onUpdateStatus={mockUpdateStatus}
        onDelete={mockDelete}
      />
    )

    // Columns with no prospects should show empty message
    const emptyMessages = screen.getAllByText('Aucun prospect')
    expect(emptyMessages.length).toBeGreaterThan(0)
  })

  it('les cartes sont draggables', () => {
    const mockUpdateStatus = jest.fn()
    const mockDelete = jest.fn()

    render(
      <KanbanBoard
        prospects={mockProspects}
        onUpdateStatus={mockUpdateStatus}
        onDelete={mockDelete}
      />
    )

    const johnCard = screen.getByText('John Doe').closest('div[draggable="true"]')
    expect(johnCard).toHaveAttribute('draggable', 'true')
  })

  it('affiche les informations complètes des prospects', () => {
    const mockUpdateStatus = jest.fn()
    const mockDelete = jest.fn()

    render(
      <KanbanBoard
        prospects={mockProspects}
        onUpdateStatus={mockUpdateStatus}
        onDelete={mockDelete}
      />
    )

    // Check all prospect information is displayed
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText(/john@acme.com/)).toBeInTheDocument()
    expect(screen.getByText(/0123456789/)).toBeInTheDocument()
    expect(screen.getByText(/10 000 €/)).toBeInTheDocument()
  })

  it('appelle onDelete lors du clic sur supprimer', async () => {
    const user = userEvent.setup()
    const mockUpdateStatus = jest.fn()
    const mockDelete = jest.fn()

    render(
      <KanbanBoard
        prospects={mockProspects}
        onUpdateStatus={mockUpdateStatus}
        onDelete={mockDelete}
      />
    )

    const deleteButtons = screen.getAllByText('✕')
    await user.click(deleteButtons[0])

    expect(mockDelete).toHaveBeenCalledWith('1')
  })
})
