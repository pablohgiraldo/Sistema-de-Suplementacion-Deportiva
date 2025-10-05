import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProducts, useProduct, useProductInventory, useInventoryStats, useStockAlerts, useInventoryMutations } from '../../hooks/useProducts'
import api from '../../services/api'

// Mock de la API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn()
  }
}))

// Wrapper para React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useProducts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches products successfully', async () => {
    const mockProducts = [
      { _id: '1', name: 'Whey Protein', price: 89.99 },
      { _id: '2', name: 'Creatine', price: 29.99 }
    ]
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockProducts }
    })

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ success: true, data: mockProducts })
    expect(api.get).toHaveBeenCalledWith('/products?')
  })

  test('fetches products with filters', async () => {
    const mockProducts = [{ _id: '1', name: 'Whey Protein', price: 89.99 }]
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockProducts }
    })

    const filters = { category: 'Proteínas', minPrice: 50 }
    const { result } = renderHook(() => useProducts(filters), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/products?category=Prote%C3%ADnas&minPrice=50')
  })

  test('handles API error', async () => {
    const error = new Error('Network error')
    api.get.mockRejectedValue(error)

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })

  test('ignores empty filter values', async () => {
    const filters = { category: '', minPrice: null, maxPrice: undefined }
    
    const { result } = renderHook(() => useProducts(filters), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(api.get).toHaveBeenCalledWith('/products?')
  })
})

describe('useProduct Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches single product successfully', async () => {
    const mockProduct = { _id: '1', name: 'Whey Protein', price: 89.99 }
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockProduct }
    })

    const { result } = renderHook(() => useProduct('1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ success: true, data: mockProduct })
    expect(api.get).toHaveBeenCalledWith('/products/1')
  })

  test('does not fetch when productId is not provided', () => {
    const { result } = renderHook(() => useProduct(), {
      wrapper: createWrapper()
    })

    expect(result.current.data).toBeUndefined()
    expect(api.get).not.toHaveBeenCalled()
  })

  test('handles product not found', async () => {
    const error = new Error('Product not found')
    error.response = { status: 404 }
    api.get.mockRejectedValue(error)

    const { result } = renderHook(() => useProduct('999'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('useProductInventory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches product inventory successfully', async () => {
    const mockInventory = {
      _id: '1',
      product: 'product-1',
      currentStock: 50,
      availableStock: 45,
      reservedStock: 5
    }
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockInventory }
    })

    const { result } = renderHook(() => useProductInventory('product-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ success: true, data: mockInventory })
    expect(api.get).toHaveBeenCalledWith('/inventory?product=product-1')
  })

  test('refetches inventory periodically', async () => {
    const mockInventory = { _id: '1', currentStock: 50 }
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockInventory }
    })

    const { result } = renderHook(() => useProductInventory('product-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Verificar que la query tiene refetchInterval configurado
    expect(result.current.dataUpdatedAt).toBeDefined()
  })

  test('does not fetch when productId is not provided', () => {
    const { result } = renderHook(() => useProductInventory(), {
      wrapper: createWrapper()
    })

    expect(result.current.data).toBeUndefined()
    expect(api.get).not.toHaveBeenCalled()
  })
})

describe('useInventoryStats Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches inventory stats successfully', async () => {
    const mockStats = {
      totalItems: 100,
      lowStockItems: 5,
      outOfStockItems: 2,
      totalValue: 50000
    }
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockStats }
    })

    const { result } = renderHook(() => useInventoryStats(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ success: true, data: mockStats })
    expect(api.get).toHaveBeenCalledWith('/inventory/stats')
  })

  test('refetches stats periodically', async () => {
    const mockStats = { totalItems: 100 }
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockStats }
    })

    const { result } = renderHook(() => useInventoryStats(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.dataUpdatedAt).toBeDefined()
  })
})

describe('useStockAlerts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches stock alerts successfully', async () => {
    const mockLowStock = [{ _id: '1', name: 'Product 1', stock: 3 }]
    const mockOutOfStock = [{ _id: '2', name: 'Product 2', stock: 0 }]
    
    api.get
      .mockResolvedValueOnce({ data: mockLowStock })
      .mockResolvedValueOnce({ data: mockOutOfStock })

    const { result } = renderHook(() => useStockAlerts(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({
      lowStock: mockLowStock,
      outOfStock: mockOutOfStock
    })
    
    expect(api.get).toHaveBeenCalledWith('/inventory/low-stock')
    expect(api.get).toHaveBeenCalledWith('/inventory/out-of-stock')
  })

  test('handles partial API failure', async () => {
    const mockLowStock = [{ _id: '1', name: 'Product 1', stock: 3 }]
    const error = new Error('Out of stock API failed')
    
    api.get
      .mockResolvedValueOnce({ data: mockLowStock })
      .mockRejectedValueOnce(error)

    const { result } = renderHook(() => useStockAlerts(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })

  test('refetches alerts periodically', async () => {
    const mockLowStock = [{ _id: '1', name: 'Product 1', stock: 3 }]
    const mockOutOfStock = []
    
    api.get
      .mockResolvedValueOnce({ data: mockLowStock })
      .mockResolvedValueOnce({ data: mockOutOfStock })

    const { result } = renderHook(() => useStockAlerts(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.dataUpdatedAt).toBeDefined()
  })
})

describe('useInventoryMutations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('restock mutation works correctly', async () => {
    const mockResponse = { success: true, data: { currentStock: 60 } }
    api.post.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useInventoryMutations(), {
      wrapper: createWrapper()
    })

    const restockData = { itemId: '1', quantity: 10, notes: 'Restock order' }
    
    await result.current.restock.mutateAsync(restockData)

    expect(api.post).toHaveBeenCalledWith('/inventory/1/restock', {
      quantity: 10,
      notes: 'Restock order'
    })
  })

  test('reserve mutation works correctly', async () => {
    const mockResponse = { success: true, data: { reservedStock: 5 } }
    api.post.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useInventoryMutations(), {
      wrapper: createWrapper()
    })

    const reserveData = { itemId: '1', quantity: 5 }
    
    await result.current.reserve.mutateAsync(reserveData)

    expect(api.post).toHaveBeenCalledWith('/inventory/1/reserve', {
      quantity: 5
    })
  })

  test('release mutation works correctly', async () => {
    const mockResponse = { success: true, data: { reservedStock: 0 } }
    api.post.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useInventoryMutations(), {
      wrapper: createWrapper()
    })

    const releaseData = { itemId: '1', quantity: 3 }
    
    await result.current.release.mutateAsync(releaseData)

    expect(api.post).toHaveBeenCalledWith('/inventory/1/release', {
      quantity: 3
    })
  })

  test('sell mutation works correctly', async () => {
    const mockResponse = { success: true, data: { currentStock: 45 } }
    api.post.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useInventoryMutations(), {
      wrapper: createWrapper()
    })

    const sellData = { itemId: '1', quantity: 5 }
    
    await result.current.sell.mutateAsync(sellData)

    expect(api.post).toHaveBeenCalledWith('/inventory/1/sell', {
      quantity: 5
    })
  })

  test('handles mutation errors', async () => {
    const error = new Error('Insufficient stock')
    api.post.mockRejectedValue(error)

    const { result } = renderHook(() => useInventoryMutations(), {
      wrapper: createWrapper()
    })

    const sellData = { itemId: '1', quantity: 100 }
    
    await expect(result.current.sell.mutateAsync(sellData)).rejects.toThrow('Insufficient stock')
  })

  test('dispatches custom event on successful restock', async () => {
    const mockResponse = { success: true, data: { currentStock: 60 } }
    api.post.mockResolvedValue({ data: mockResponse })

    // Mock addEventListener para capturar el evento
    const eventListener = vi.fn()
    window.addEventListener('inventoryUpdated', eventListener)

    const { result } = renderHook(() => useInventoryMutations(), {
      wrapper: createWrapper()
    })

    const restockData = { itemId: '1', quantity: 10, notes: 'Restock order' }
    
    await result.current.restock.mutateAsync(restockData)

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventoryUpdated',
        detail: expect.objectContaining({
          action: 'restock',
          itemId: '1',
          data: mockResponse
        })
      })
    )

    window.removeEventListener('inventoryUpdated', eventListener)
  })
})
