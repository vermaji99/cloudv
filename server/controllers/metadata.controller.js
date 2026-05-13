const jsforce = require('jsforce');

// @desc    Fetch validation rules for Account object
// @route   GET /api/metadata/validation-rules
exports.getValidationRules = async (req, res) => {
    try {
        if (!req.user || !req.user.instanceUrl || !req.user.accessToken) {
            console.error('Metadata Error: Missing user session data', req.user);
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.'
            });
        }

        console.log('Fetching validation rules for:', req.user.username);

        const conn = new jsforce.Connection({
            instanceUrl: req.user.instanceUrl,
            accessToken: req.user.accessToken
        });

        // Use Tooling API to fetch validation rules
        // EntityDefinitionId for Account is usually 'Account'
        const query = `
            SELECT Id, ValidationName, Active, EntityDefinitionId, ErrorDisplayField, ErrorMessage 
            FROM ValidationRule 
            WHERE EntityDefinitionId = 'Account'
        `;

        const result = await conn.tooling.query(query);

        res.json({
            success: true,
            count: result.totalSize,
            data: result.records
        });
    } catch (err) {
        console.error('Fetch Metadata Error:', err);
        
        // Check if it's a Salesforce session error
        if (err.name === 'INVALID_SESSION_ID' || err.message?.includes('Session expired')) {
            return res.status(401).json({
                success: false,
                message: 'Salesforce session expired. Please login again.'
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch validation rules'
        });
    }
};

// @desc    Toggle validation rule active status
// @route   PATCH /api/metadata/validation-rule/:id
exports.toggleValidationRule = async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined) {
        return res.status(400).json({ success: false, message: 'Active status is required' });
    }

    try {
        if (!req.user || !req.user.instanceUrl || !req.user.accessToken) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.'
            });
        }

        const conn = new jsforce.Connection({
            instanceUrl: req.user.instanceUrl,
            accessToken: req.user.accessToken
        });

        // Fetch the full metadata of the rule first
        const rule = await conn.tooling.sobject('ValidationRule').retrieve(id);
        
        if (!rule || !rule.Metadata) {
            return res.status(404).json({ success: false, message: 'Validation rule metadata not found' });
        }

        // Prepare the update object with the modified Metadata
        const updatePayload = {
            Id: id,
            Metadata: {
                ...rule.Metadata,
                active: active
            }
        };

        const result = await conn.tooling.sobject('ValidationRule').update(updatePayload);

        if (result.success) {
            res.json({
                success: true,
                message: `Validation rule ${active ? 'enabled' : 'disabled'} successfully`
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.errors.join(', ')
            });
        }
    } catch (err) {
        console.error('Update Metadata Error:', err);

        // Check if it's a Salesforce session error
        if (err.name === 'INVALID_SESSION_ID' || err.message?.includes('Session expired')) {
            return res.status(401).json({
                success: false,
                message: 'Salesforce session expired. Please login again.'
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || 'Failed to update validation rule'
        });
    }
};

// @desc    Bulk update validation rules
// @route   POST /api/metadata/validation-rules/bulk
exports.bulkUpdateValidationRules = async (req, res) => {
    const { updates } = req.body; // Array of { Id, Active }

    console.log('Bulk Update - Received updates:', JSON.stringify(updates));

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ success: false, message: 'Updates array is required' });
    }

    try {
        if (!req.user || !req.user.instanceUrl || !req.user.accessToken) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.'
            });
        }

        const conn = new jsforce.Connection({
            instanceUrl: req.user.instanceUrl,
            accessToken: req.user.accessToken
        });

        // Use Tooling API to update multiple rules
        // We'll process them one by one to catch individual errors
        const results = [];
        for (const update of updates) {
            try {
                console.log(`Bulk Update - Updating rule ${update.Id} to Active=${update.Active}`);
                
                // Fetch the full metadata of the rule first
                // This is required for ValidationRule updates in Tooling API
                const rule = await conn.tooling.sobject('ValidationRule').retrieve(update.Id);
                
                if (!rule || !rule.Metadata) {
                    throw new Error('Could not retrieve rule metadata');
                }

                // Prepare the update object with the modified Metadata
                const updatePayload = {
                    Id: update.Id,
                    Metadata: {
                        ...rule.Metadata,
                        active: update.Active
                    }
                };

                const result = await conn.tooling.sobject('ValidationRule').update(updatePayload);
                results.push({ id: update.Id, ...result });
            } catch (singleErr) {
                console.error(`Bulk Update - Error updating rule ${update.Id}:`, singleErr.message);
                results.push({ id: update.Id, success: false, errors: [singleErr.message] });
            }
        }

        const failedUpdates = results.filter(r => !r.success);
        
        if (failedUpdates.length === 0) {
            res.json({
                success: true,
                message: `${updates.length} validation rules updated successfully`
            });
        } else {
            const errorMessages = failedUpdates.map(f => `${f.id}: ${f.errors.join(', ')}`);
            console.error('Bulk Update - Some updates failed:', errorMessages);
            res.status(400).json({
                success: false,
                message: `Failed to update ${failedUpdates.length} rule(s)`,
                errors: errorMessages
            });
        }
    } catch (err) {
        console.error('Bulk Update Metadata Error:', err);

        // Check if it's a Salesforce session error
        if (err.name === 'INVALID_SESSION_ID' || err.message?.includes('Session expired')) {
            return res.status(401).json({
                success: false,
                message: 'Salesforce session expired. Please login again.'
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || 'Failed to bulk update validation rules'
        });
    }
};
