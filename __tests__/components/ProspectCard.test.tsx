import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProspectCard } from '@/components/ProspectCard'
import { Prospect } from '@/types'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

const mockProspect: Prospect = {
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
}

describe('ProspectCard', () => {
  it('affiche correctement les informations du prospect', () => {
    const mockDelete = jest.fn()
    
    render(<ProspectCard prospect={mockProspect} onDelete={mockDelete} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('📧 john@acme.com')).toBeInTheDocument()
    expect(screen.getByText('📱 0123456789')).toBeInTheDocument()
    expect(screen.getByText('📍 123 Main St')).toBeInTheDocument()
    expect(screen.getByText(/10 000 €/)).toBeInTheDocument()
  })

  it('affiche le statut correct', () => {
    const mockDelete = jest.fn()
    
    render(<ProspectCard prospect={mockProspect} onDelete={mockDelete} />)

    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('affiche un badge sans valeur estimée si non fournie', () => {
    const mockDelete = jest.fn()
    const prospectSansValeur = { ...mockProspect, valeurEstimee: undefined }
    
    render(<ProspectCard prospect={prospectSansValeur} onDelete={mockDelete} />)

    expect(screen.queryByText(/€/)).not.toBeInTheDocument()
  })

  it('appelle onDelete lors du clic sur Supprimer', async () => {
    const user = userEvent.setup()
    const mockDelete = jest.fn()
    
    render(<ProspectCard prospect={mockProspect} onDelete={mockDelete} />)

    const deleteButton = screen.getByText('Supprimer')
    await user.click(deleteButton)

    expect(mockDelete).toHaveBeenCalledWith('1')
  })

  it('affiche un dropdown de statut quand onStatusChange est fourni', () => {
    const mockDelete = jest.fn()
    const mockStatusChange = jest.fn()
    
    render(
      <ProspectCard 
        prospect={mockProspect} 
        onDelete={mockDelete}
        onStatusChange={mockStatusChange}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('nouveau')
  })

  it('affiche un badge statique quand onStatusChange n\'est pas fourni', () => {
    const mockDelete = jest.fn()
    
    render(<ProspectCard prospect={mockProspect} onDelete={mockDelete} />)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })

  it('appelle onStatusChange lors du changement de statut', async () => {
    const user = userEvent.setup()
    const mockDelete = jest.fn()
    const mockStatusChange = jest.fn()
    
    render(
      <ProspectCard 
        prospect={mockProspect} 
        onDelete={mockDelete}
        onStatusChange={mockStatusChange}
      />
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'conclu')

    expect(mockStatusChange).toHaveBeenCalledWith('1', 'conclu')
  })

  it('affiche le lien vers la page de détails', () => {
    const mockDelete = jest.fn()
    
    render(<ProspectCard prospect={mockProspect} onDelete={mockDelete} />)

    const link = screen.getByText('Voir détails').closest('a')
    expect(link).toHaveAttribute('href', '/prospects/1')
  })
})
