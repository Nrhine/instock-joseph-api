export const validateWarehouseData = (data) => {
    const requiredFields = [
        'warehouse_name',
        'address',
        'city',
        'country',
        'contact_name',
        'contact_position',
        'contact_phone',
        'contact_email'
    ];

    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            return `${field.replace('_', ' ')} is required`;
        }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact_email)) {
        return 'Invalid email address';
    }

    // Validate phone number
    const phoneRegex = /^\+?1?\s*\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    if (!phoneRegex.test(data.contact_phone)) {
        return 'Invalid phone number';
    }

    return null; // No validation errors
};