import {
    saveAccessToken,
    saveRefreshToken,
    saveUser,
    getAccessToken,
    getRefreshToken,
    getUser,
    saveAuthData,
    clearAuthData,
    hasValidTokens,
    getAuthData
} from '../../utils/tokenUtils'

describe('tokenUtils', () => {
    beforeEach(() => {
        // Limpiar localStorage antes de cada test
        localStorage.clear()
        // Limpiar mocks de console
        vi.clearAllMocks()
    })

    describe('saveAccessToken', () => {
        test('saves access token to localStorage', () => {
            const token = 'test-access-token'

            saveAccessToken(token)

            expect(localStorage.getItem('accessToken')).toBe(token)
        })

        test('handles localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            // Mock localStorage.setItem to throw error
            const originalSetItem = localStorage.setItem
            localStorage.setItem = vi.fn().mockImplementation(() => {
                throw new Error('localStorage error')
            })

            saveAccessToken('test-token')

            expect(consoleSpy).toHaveBeenCalledWith('Error guardando access token:', expect.any(Error))

            // Restore original localStorage.setItem
            localStorage.setItem = originalSetItem
            consoleSpy.mockRestore()
        })
    })

    describe('saveRefreshToken', () => {
        test('saves refresh token to localStorage', () => {
            const token = 'test-refresh-token'

            saveRefreshToken(token)

            expect(localStorage.getItem('refreshToken')).toBe(token)
        })

        test('handles localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const originalSetItem = localStorage.setItem
            localStorage.setItem = vi.fn().mockImplementation(() => {
                throw new Error('localStorage error')
            })

            saveRefreshToken('test-token')

            expect(consoleSpy).toHaveBeenCalledWith('Error guardando refresh token:', expect.any(Error))

            localStorage.setItem = originalSetItem
            consoleSpy.mockRestore()
        })
    })

    describe('saveUser', () => {
        test('saves user data to localStorage as JSON string', () => {
            const user = { id: '1', name: 'Test User', email: 'test@example.com' }

            saveUser(user)

            const savedUser = localStorage.getItem('user')
            expect(JSON.parse(savedUser)).toEqual(user)
        })

        test('handles localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const originalSetItem = localStorage.setItem
            localStorage.setItem = vi.fn().mockImplementation(() => {
                throw new Error('localStorage error')
            })

            saveUser({ id: '1', name: 'Test' })

            expect(consoleSpy).toHaveBeenCalledWith('Error guardando datos del usuario:', expect.any(Error))

            localStorage.setItem = originalSetItem
            consoleSpy.mockRestore()
        })
    })

    describe('getAccessToken', () => {
        test('retrieves access token from localStorage', () => {
            const token = 'test-access-token'
            localStorage.setItem('accessToken', token)

            const result = getAccessToken()

            expect(result).toBe(token)
        })

        test('returns null when no access token exists', () => {
            const result = getAccessToken()

            expect(result).toBeNull()
        })

        test('handles localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const originalGetItem = localStorage.getItem
            localStorage.getItem = vi.fn().mockImplementation(() => {
                throw new Error('localStorage error')
            })

            const result = getAccessToken()

            expect(result).toBeNull()
            expect(consoleSpy).toHaveBeenCalledWith('Error obteniendo access token:', expect.any(Error))

            localStorage.getItem = originalGetItem
            consoleSpy.mockRestore()
        })
    })

    describe('getRefreshToken', () => {
        test('retrieves refresh token from localStorage', () => {
            const token = 'test-refresh-token'
            localStorage.setItem('refreshToken', token)

            const result = getRefreshToken()

            expect(result).toBe(token)
        })

        test('returns null when no refresh token exists', () => {
            const result = getRefreshToken()

            expect(result).toBeNull()
        })

        test('handles localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const originalGetItem = localStorage.getItem
            localStorage.getItem = vi.fn().mockImplementation(() => {
                throw new Error('localStorage error')
            })

            const result = getRefreshToken()

            expect(result).toBeNull()
            expect(consoleSpy).toHaveBeenCalledWith('Error obteniendo refresh token:', expect.any(Error))

            localStorage.getItem = originalGetItem
            consoleSpy.mockRestore()
        })
    })

    describe('getUser', () => {
        test('retrieves and parses user data from localStorage', () => {
            const user = { id: '1', name: 'Test User', email: 'test@example.com' }
            localStorage.setItem('user', JSON.stringify(user))

            const result = getUser()

            expect(result).toEqual(user)
        })

        test('returns null when no user data exists', () => {
            const result = getUser()

            expect(result).toBeNull()
        })

        test('returns null for invalid JSON', () => {
            localStorage.setItem('user', 'invalid-json')

            const result = getUser()

            expect(result).toBeNull()
        })

        test('handles localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const originalGetItem = localStorage.getItem
            localStorage.getItem = vi.fn().mockImplementation(() => {
                throw new Error('localStorage error')
            })

            const result = getUser()

            expect(result).toBeNull()
            expect(consoleSpy).toHaveBeenCalledWith('Error obteniendo datos del usuario:', expect.any(Error))

            localStorage.getItem = originalGetItem
            consoleSpy.mockRestore()
        })
    })

    describe('saveAuthData', () => {
        test('saves all auth data when all fields are provided', () => {
            const authData = {
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                user: { id: '1', name: 'Test User' }
            }

            saveAuthData(authData)

            expect(localStorage.getItem('accessToken')).toBe(authData.accessToken)
            expect(localStorage.getItem('refreshToken')).toBe(authData.refreshToken)
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(authData.user)
        })

        test('saves only provided fields', () => {
            const authData = {
                accessToken: 'test-access-token',
                user: { id: '1', name: 'Test User' }
            }

            saveAuthData(authData)

            expect(localStorage.getItem('accessToken')).toBe(authData.accessToken)
            expect(localStorage.getItem('refreshToken')).toBeNull()
            expect(JSON.parse(localStorage.getItem('user'))).toEqual(authData.user)
        })

        test('handles empty auth data object', () => {
            saveAuthData({})

            expect(localStorage.getItem('accessToken')).toBeNull()
            expect(localStorage.getItem('refreshToken')).toBeNull()
            expect(localStorage.getItem('user')).toBeNull()
        })

        test('handles null/undefined values', () => {
            const authData = {
                accessToken: null,
                refreshToken: undefined,
                user: null
            }

            saveAuthData(authData)

            expect(localStorage.getItem('accessToken')).toBeNull()
            expect(localStorage.getItem('refreshToken')).toBeNull()
            expect(localStorage.getItem('user')).toBeNull()
        })
    })

    describe('clearAuthData', () => {
        test('removes all auth data from localStorage', () => {
            // Set up some data first
            localStorage.setItem('accessToken', 'test-access-token')
            localStorage.setItem('refreshToken', 'test-refresh-token')
            localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }))

            clearAuthData()

            expect(localStorage.getItem('accessToken')).toBeNull()
            expect(localStorage.getItem('refreshToken')).toBeNull()
            expect(localStorage.getItem('user')).toBeNull()
        })

        test('handles localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const originalRemoveItem = localStorage.removeItem
            localStorage.removeItem = vi.fn().mockImplementation(() => {
                throw new Error('localStorage error')
            })

            clearAuthData()

            expect(consoleSpy).toHaveBeenCalledWith('Error limpiando datos de autenticación:', expect.any(Error))

            localStorage.removeItem = originalRemoveItem
            consoleSpy.mockRestore()
        })
    })

    describe('hasValidTokens', () => {
        test('returns true when both tokens exist', () => {
            localStorage.setItem('accessToken', 'test-access-token')
            localStorage.setItem('refreshToken', 'test-refresh-token')

            const result = hasValidTokens()

            expect(result).toBe(true)
        })

        test('returns false when access token is missing', () => {
            localStorage.setItem('refreshToken', 'test-refresh-token')

            const result = hasValidTokens()

            expect(result).toBe(false)
        })

        test('returns false when refresh token is missing', () => {
            localStorage.setItem('accessToken', 'test-access-token')

            const result = hasValidTokens()

            expect(result).toBe(false)
        })

        test('returns false when both tokens are missing', () => {
            const result = hasValidTokens()

            expect(result).toBe(false)
        })

        test('returns false when tokens are empty strings', () => {
            localStorage.setItem('accessToken', '')
            localStorage.setItem('refreshToken', '')

            const result = hasValidTokens()

            expect(result).toBe(false)
        })
    })

    describe('getAuthData', () => {
        test('returns all auth data when available', () => {
            const accessToken = 'test-access-token'
            const refreshToken = 'test-refresh-token'
            const user = { id: '1', name: 'Test User' }

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            const result = getAuthData()

            expect(result).toEqual({
                accessToken,
                refreshToken,
                user
            })
        })

        test('returns null values for missing data', () => {
            const result = getAuthData()

            expect(result).toEqual({
                accessToken: null,
                refreshToken: null,
                user: null
            })
        })

        test('returns partial data when only some fields exist', () => {
            const accessToken = 'test-access-token'
            const user = { id: '1', name: 'Test User' }

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('user', JSON.stringify(user))

            const result = getAuthData()

            expect(result).toEqual({
                accessToken,
                refreshToken: null,
                user
            })
        })
    })

    describe('Integration tests', () => {
        test('complete auth flow works correctly', () => {
            const authData = {
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                user: { id: '1', name: 'Test User', email: 'test@example.com' }
            }

            // Save auth data
            saveAuthData(authData)

            // Verify tokens are valid
            expect(hasValidTokens()).toBe(true)

            // Retrieve auth data
            const retrievedData = getAuthData()
            expect(retrievedData).toEqual(authData)

            // Clear auth data
            clearAuthData()

            // Verify tokens are no longer valid
            expect(hasValidTokens()).toBe(false)
            expect(getAuthData()).toEqual({
                accessToken: null,
                refreshToken: null,
                user: null
            })
        })

        test('handles localStorage quota exceeded', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            // Mock localStorage.setItem to simulate quota exceeded
            const originalSetItem = localStorage.setItem
            localStorage.setItem = vi.fn().mockImplementation(() => {
                throw new DOMException('Quota exceeded', 'QuotaExceededError')
            })

            saveAccessToken('test-token')

            expect(consoleSpy).toHaveBeenCalledWith('Error guardando access token:', expect.any(DOMException))

            localStorage.setItem = originalSetItem
            consoleSpy.mockRestore()
        })
    })
})
