import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { useProspects } from '@/hooks/useProspects'
import { supabase } from '@/lib/supabaseClient'

// Mock data
const mockProspects = [
  {
    id: '1',
    nom: 'John Doe',
    entreprise: 'Acme Corp',
    email: 'john@acme.com',
    telephone: '0123456789',
    adresse: '123 Main St',
    status: 'nouveau',
    valeur_estimee: 10000,
    date_creation: '2026-01-01T00:00:00.000Z',
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
    valeur_estimee: 20000,
    date_creation: '2026-01-15T00:00:00.000Z',
    interactions: [],
  },
]

describe('useProspects Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('charge les prospects au montage', async () => {
    // Mock Supabase response
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockProspects, error: null })),
        })),
      })),
    }))
    ;(supabase.from as jest.Mock) = mockFrom

    const { result } = renderHook(() => useProspects())

    // Initial loading state
    expect(result.current.isLoading).toBe(true)
    expect(result.current.prospects).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.prospects).toHaveLength(2)
    expect(result.current.prospects[0].nom).toBe('John Doe')
    expect(mockFrom).toHaveBeenCalledWith('prospects')
  })

  it('ajoute un nouveau prospect', async () => {
    const newProspect = {
      id: '3',
      nom: 'Bob Johnson',
      entreprise: 'NewCo',
      email: 'bob@newco.com',
      telephone: '1234567890',
      adresse: '789 Pine St',
      status: 'nouveau',
      valeur_estimee: 15000,
      date_creation: '2026-01-20T00:00:00.000Z',
      interactions: [],
    }

    // Mock initial load
    const mockFrom = jest.fn((table) => {
      if (table === 'prospects') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockProspects, error: null })),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: newProspect, error: null })),
            })),
          })),
        }
      }
    })
    ;(supabase.from as jest.Mock) = mockFrom

    const { result } = renderHook(() => useProspects())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Add prospect
    await act(async () => {
      await result.current.addProspect({
        nom: 'Bob Johnson',
        entreprise: 'NewCo',
        email: 'bob@newco.com',
        telephone: '1234567890',
        adresse: '789 Pine St',
        status: 'nouveau',
        valeurEstimee: 15000,
        dateCreation: '2026-01-20T00:00:00.000Z',
        interactions: [],
      })
    })

    expect(result.current.prospects).toHaveLength(3)
    expect(result.current.prospects[0].nom).toBe('Bob Johnson')
  })

  it('met à jour un prospect', async () => {
    const updatedProspect = {
      ...mockProspects[0],
      status: 'conclu',
      valeur_estimee: 12000,
    }

    const mockFrom = jest.fn((table) => {
      if (table === 'prospects') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockProspects, error: null })),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: updatedProspect, error: null })),
              })),
            })),
          })),
        }
      }
    })
    ;(supabase.from as jest.Mock) = mockFrom

    const { result } = renderHook(() => useProspects())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.updateProspect('1', { status: 'conclu', valeurEstimee: 12000 })
    })

    expect(result.current.prospects[0].status).toBe('conclu')
    expect(result.current.prospects[0].valeurEstimee).toBe(12000)
  })

  it('supprime un prospect', async () => {
    const mockFrom = jest.fn((table) => {
      if (table === 'prospects') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockProspects, error: null })),
            })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        }
      }
    })
    ;(supabase.from as jest.Mock) = mockFrom

    const { result } = renderHook(() => useProspects())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.prospects).toHaveLength(2)

    await act(async () => {
      await result.current.deleteProspect('1')
    })

    expect(result.current.prospects).toHaveLength(1)
    expect(result.current.prospects[0].id).toBe('2')
  })

  it('gère les erreurs de chargement', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
        })),
      })),
    }))
    ;(supabase.from as jest.Mock) = mockFrom

    const { result } = renderHook(() => useProspects())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.prospects).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
