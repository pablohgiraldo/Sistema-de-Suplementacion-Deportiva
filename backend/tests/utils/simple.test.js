/**
 * Tests simples para utilidades básicas
 * Objetivo: Mejorar cobertura de tests
 */

describe('Simple Utility Tests', () => {
    describe('String Utilities', () => {
        test('should capitalize first letter', () => {
            const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('world')).toBe('World');
            expect(capitalize('test')).toBe('Test');
        });

        test('should format currency', () => {
            const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

            expect(formatCurrency(29.99)).toBe('$29.99');
            expect(formatCurrency(100)).toBe('$100.00');
            expect(formatCurrency(0)).toBe('$0.00');
        });

        test('should truncate text', () => {
            const truncate = (text, maxLength) => {
                return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
            };

            expect(truncate('This is a long text', 10)).toBe('This is a ...');
            expect(truncate('Short', 10)).toBe('Short');
        });

        test('should generate random string', () => {
            const generateRandomString = (length) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                for (let i = 0; i < length; i++) {
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            };

            const randomString = generateRandomString(10);
            expect(randomString).toHaveLength(10);
            expect(typeof randomString).toBe('string');
        });
    });

    describe('Number Utilities', () => {
        test('should calculate percentage', () => {
            const calculatePercentage = (part, total) => {
                return total === 0 ? 0 : Math.round((part / total) * 100);
            };

            expect(calculatePercentage(25, 100)).toBe(25);
            expect(calculatePercentage(50, 200)).toBe(25);
            expect(calculatePercentage(0, 100)).toBe(0);
            expect(calculatePercentage(100, 0)).toBe(0);
        });

        test('should round to decimal places', () => {
            const roundTo = (num, decimals) => {
                return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
            };

            expect(roundTo(3.14159, 2)).toBe(3.14);
            expect(roundTo(2.71828, 3)).toBe(2.718);
            expect(roundTo(1.5, 0)).toBe(2);
        });

        test('should generate random number', () => {
            const generateRandomNumber = (min, max) => {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            const randomNum = generateRandomNumber(1, 100);
            expect(randomNum).toBeGreaterThanOrEqual(1);
            expect(randomNum).toBeLessThanOrEqual(100);
        });
    });

    describe('Date Utilities', () => {
        test('should format date', () => {
            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };

            const testDate = new Date('2024-01-15');
            expect(formatDate(testDate)).toBe('2024-01-15');
        });

        test('should calculate date difference', () => {
            const calculateDaysDifference = (date1, date2) => {
                const diffTime = Math.abs(date2 - date1);
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            };

            const date1 = new Date('2024-01-01');
            const date2 = new Date('2024-01-10');
            expect(calculateDaysDifference(date1, date2)).toBe(9);
        });

        test('should check if date is valid', () => {
            const isValidDate = (date) => {
                return date instanceof Date && !isNaN(date);
            };

            expect(isValidDate(new Date())).toBe(true);
            expect(isValidDate(new Date('2024-01-01'))).toBe(true);
            expect(isValidDate(new Date('invalid'))).toBe(false);
            expect(isValidDate('not a date')).toBe(false);
        });
    });

    describe('Array Utilities', () => {
        test('should remove duplicates', () => {
            const removeDuplicates = (arr) => [...new Set(arr)];

            expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
            expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
        });

        test('should shuffle array', () => {
            const shuffle = (arr) => {
                const shuffled = [...arr];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
            };

            const original = [1, 2, 3, 4, 5];
            const shuffled = shuffle(original);

            expect(shuffled).toHaveLength(original.length);
            expect(shuffled.sort()).toEqual(original.sort());
        });

        test('should group by property', () => {
            const groupBy = (arr, key) => {
                return arr.reduce((groups, item) => {
                    const group = item[key];
                    groups[group] = groups[group] || [];
                    groups[group].push(item);
                    return groups;
                }, {});
            };

            const data = [
                { category: 'A', value: 1 },
                { category: 'B', value: 2 },
                { category: 'A', value: 3 }
            ];

            const grouped = groupBy(data, 'category');
            expect(grouped.A).toHaveLength(2);
            expect(grouped.B).toHaveLength(1);
        });
    });

    describe('Object Utilities', () => {
        test('should deep clone object', () => {
            const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

            const original = { a: 1, b: { c: 2, d: [3, 4] } };
            const cloned = deepClone(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
            expect(cloned.b).not.toBe(original.b);
        });

        test('should merge objects', () => {
            const merge = (target, source) => ({ ...target, ...source });

            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: 3, c: 4 };
            const merged = merge(obj1, obj2);

            expect(merged).toEqual({ a: 1, b: 3, c: 4 });
        });

        test('should check if object is empty', () => {
            const isEmpty = (obj) => Object.keys(obj).length === 0;

            expect(isEmpty({})).toBe(true);
            expect(isEmpty({ a: 1 })).toBe(false);
            expect(isEmpty({})).toBe(true);
        });
    });

    describe('Validation Utilities', () => {
        test('should validate email', () => {
            const isValidEmail = (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };

            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user@domain.co')).toBe(true);
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
        });

        test('should validate phone number', () => {
            const isValidPhone = (phone) => {
                const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
                return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
            };

            expect(isValidPhone('+573001234567')).toBe(true);
            expect(isValidPhone('3001234567')).toBe(true);
            expect(isValidPhone('123')).toBe(false);
            expect(isValidPhone('invalid')).toBe(false);
        });

        test('should validate password strength', () => {
            const isValidPassword = (password) => {
                return password.length >= 8 &&
                    /[A-Z]/.test(password) &&
                    /[a-z]/.test(password) &&
                    /[0-9]/.test(password);
            };

            expect(isValidPassword('Password123')).toBe(true);
            expect(isValidPassword('password123')).toBe(false);
            expect(isValidPassword('PASSWORD123')).toBe(false);
            expect(isValidPassword('Password')).toBe(false);
            expect(isValidPassword('Pass123')).toBe(false);
        });
    });

    describe('File Utilities', () => {
        test('should get file extension', () => {
            const getFileExtension = (filename) => {
                return filename.split('.').pop().toLowerCase();
            };

            expect(getFileExtension('document.pdf')).toBe('pdf');
            expect(getFileExtension('image.JPG')).toBe('jpg');
            expect(getFileExtension('script.js')).toBe('js');
        });

        test('should validate file type', () => {
            const isValidFileType = (filename, allowedTypes) => {
                const extension = filename.split('.').pop().toLowerCase();
                return allowedTypes.includes(extension);
            };

            const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
            expect(isValidFileType('image.jpg', allowedTypes)).toBe(true);
            expect(isValidFileType('document.pdf', allowedTypes)).toBe(false);
        });

        test('should format file size', () => {
            const formatFileSize = (bytes) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };

            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1048576)).toBe('1 MB');
            expect(formatFileSize(0)).toBe('0 Bytes');
        });
    });
});

