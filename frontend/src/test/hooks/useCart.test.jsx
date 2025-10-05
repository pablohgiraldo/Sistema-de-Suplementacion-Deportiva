import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCartItems, useCartCount, useCartMutations } from '../../hooks/useCart'
import api from '../../services/api'

// Mock de la API
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
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

describe('useCartItems Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches cart items successfully', async () => {
    const mockCartItems = [
      {
        _id: '1',
        product: { _id: '1', name: 'Whey Protein', price: 89.99 },
        quantity: 2
      },
      {
        _id: '2',
        product: { _id: '2', name: 'Creatine', price: 29.99 },
        quantity: 1
      }
    ]
    
    api.get.mockResolvedValue({
      data: { success: true, data: mockCartItems }
    })

    const { result } = renderHook(() => useCartItems(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ success: true, data: mockCartItems })
    expect(api.get).toHaveBeenCalledWith('/cart')
  })

  test('handles empty cart', async () => {
    api.get.mockResolvedValue({
      data: { success: true, data: [] }
    })

    const { result } = renderHook(() => useCartItems(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ success: true, data: [] })
  })

  test('handles API error', async () => {
    const error = new Error('Cart API error')
    api.get.mockRejectedValue(error)

    const { result } = renderHook(() => useCartItems(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })

  test('has correct stale time and gc time', () => {
    const { result } = renderHook(() => useCartItems(), {
      wrapper: createWrapper()
    })

    // Verificar que la query tiene los tiempos correctos configurados
    expect(result.current.dataUpdatedAt).toBeDefined()
  })
})

describe('useCartCount Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches cart count successfully', async () => {
    const mockCartItems = [
      { _id: '1', product: '1', quantity: 2 },
      { _id: '2', product: '2', quantity: 1 }
    ]
    
    api.get.mockResolvedValue({
      data: { success: true, data: { items: mockCartItems } }
    })

    const { result } = renderHook(() => useCartCount(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBe(2)
    expect(api.get).toHaveBeenCalledWith('/cart')
  })

  test('returns 0 for empty cart', async () => {
    api.get.mockResolvedValue({
      data: { success: true, data: { items: [] } }
    })

    const { result } = renderHook(() => useCartCount(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBe(0)
  })

  test('returns 0 when items array is undefined', async () => {
    api.get.mockResolvedValue({
      data: { success: true, data: {} }
    })

    const { result } = renderHook(() => useCartCount(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBe(0)
  })

  test('handles API error', async () => {
    const error = new Error('Cart count API error')
    api.get.mockRejectedValue(error)

    const { result } = renderHook(() => useCartCount(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('useCartMutations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('addToCart mutation works correctly', async () => {
    const mockProduct = { _id: '1', name: 'Whey Protein', price: 89.99 }
    const mockResponse = { success: true, data: { message: 'Product added to cart' } }
    
    api.post.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    await result.current.addToCart.mutateAsync(mockProduct)

    expect(api.post).toHaveBeenCalledWith('/cart/add', {
      productId: mockProduct._id,
      quantity: 1
    })
  })

  test('updateQuantity mutation works correctly', async () => {
    const mockResponse = { success: true, data: { message: 'Quantity updated' } }
    
    api.put.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    const updateData = { productId: '1', quantity: 3 }
    
    await result.current.updateQuantity.mutateAsync(updateData)

    expect(api.put).toHaveBeenCalledWith('/cart/update', updateData)
  })

  test('removeFromCart mutation works correctly', async () => {
    const mockResponse = { success: true, data: { message: 'Product removed from cart' } }
    
    api.delete.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    await result.current.removeFromCart.mutateAsync('1')

    expect(api.delete).toHaveBeenCalledWith('/cart/remove/1')
  })

  test('clearCart mutation works correctly', async () => {
    const mockResponse = { success: true, data: { message: 'Cart cleared' } }
    
    api.delete.mockResolvedValue({ data: mockResponse })

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    await result.current.clearCart.mutateAsync()

    expect(api.delete).toHaveBeenCalledWith('/cart/clear')
  })

  test('addToCart handles errors', async () => {
    const error = new Error('Product not available')
    api.post.mockRejectedValue(error)

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    const mockProduct = { _id: '1', name: 'Whey Protein', price: 89.99 }
    
    await expect(result.current.addToCart.mutateAsync(mockProduct)).rejects.toThrow('Product not available')
  })

  test('updateQuantity handles errors', async () => {
    const error = new Error('Invalid quantity')
    api.put.mockRejectedValue(error)

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    const updateData = { productId: '1', quantity: -1 }
    
    await expect(result.current.updateQuantity.mutateAsync(updateData)).rejects.toThrow('Invalid quantity')
  })

  test('removeFromCart handles errors', async () => {
    const error = new Error('Product not in cart')
    api.delete.mockRejectedValue(error)

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    await expect(result.current.removeFromCart.mutateAsync('999')).rejects.toThrow('Product not in cart')
  })

  test('clearCart handles errors', async () => {
    const error = new Error('Failed to clear cart')
    api.delete.mockRejectedValue(error)

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    await expect(result.current.clearCart.mutateAsync()).rejects.toThrow('Failed to clear cart')
  })

  test('mutations invalidate cart queries on success', async () => {
    const mockResponse = { success: true, data: { message: 'Product added to cart' } }
    api.post.mockResolvedValue({ data: mockResponse })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    // Mock invalidateQueries
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCartMutations(), { wrapper })

    const mockProduct = { _id: '1', name: 'Whey Protein', price: 89.99 }
    
    await result.current.addToCart.mutateAsync(mockProduct)

    // Verificar que se invalidaron las queries correctas
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['cart', 'items'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['cart', 'count'] })
  })

  test('clearCart invalidates all cart queries', async () => {
    const mockResponse = { success: true, data: { message: 'Cart cleared' } }
    api.delete.mockResolvedValue({ data: mockResponse })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCartMutations(), { wrapper })

    await result.current.clearCart.mutateAsync()

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['cart'] })
  })

  test('mutations show loading state', async () => {
    const mockResponse = { success: true, data: { message: 'Product added to cart' } }
    
    // Simular delay en la API
    api.post.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ data: mockResponse }), 100)
      )
    )

    const { result } = renderHook(() => useCartMutations(), {
      wrapper: createWrapper()
    })

    const mockProduct = { _id: '1', name: 'Whey Protein', price: 89.99 }
    
    // Iniciar mutación
    result.current.addToCart.mutate(mockProduct)

    expect(result.current.addToCart.isPending).toBe(true)

    await waitFor(() => {
      expect(result.current.addToCart.isSuccess).toBe(true)
    })
  })
})
