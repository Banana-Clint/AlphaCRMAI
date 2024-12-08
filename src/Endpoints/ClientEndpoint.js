
const pool = require('../Config/MySQL.js');

//Retrieves All client rows
exports.ClientData = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clients');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching client data:', error);
        res.status(500).json({ error: 'Error fetching client data' });
    }
};

//Retrieves a selected client's meta data and returns a synthetic json Object 
exports.ClientMetaData = async (req, res) => {
    const clientId = req.query.clientId; 
    console.log(clientId);
  
    try {
      // Query for the client's details
      const clientQuery = `SELECT id AS client_id, name AS client_name, email AS client_email, phone_number AS client_phone, city AS client_city, country AS client_country, status AS client_status FROM clients WHERE id = ?`;
      const [clientRows] = await pool.query(clientQuery, [clientId]);
  
      if (clientRows.length === 0) {
        return res.status(404).json({ error: 'Client not found' });
      }
  
      // Query for documents
      const documentQuery = `SELECT id AS document_id, type AS document_type, status AS document_status, amount AS document_amount, products AS document_product, created_by AS document_creator FROM documents WHERE client_id = ?`;
      const [documentRows] = await pool.query(documentQuery, [clientId]);
  
      // Query for events
      const eventQuery = `SELECT id AS event_id, owner_id AS event_owner, name AS event_name, description AS event_description, starting_at AS event_date, ending_at AS event_end_date, created_at AS event_creation_date, created_by AS event_creator FROM events WHERE client_id = ?`;
      const [eventRows] = await pool.query(eventQuery, [clientId]);
  
      // Query for history
      const historyQuery = `SELECT id AS history_id, action AS history_action, created_at AS creation_date, created_by AS history_creator FROM history WHERE client_id = ?`;
      const [historyRows] = await pool.query(historyQuery, [clientId]);
  
      // Query for notes
      const noteQuery = `SELECT id AS note_id, description AS note_content, created_at AS note_created_at, created_by AS note_creator FROM notes WHERE client_id = ?`;
      const [noteRows] = await pool.query(noteQuery, [clientId]);
  
      // Construct the response
      const metadata = {
        client: clientRows[0],
        documents: documentRows,
        events: eventRows,
        history: historyRows,
        notes: noteRows
      };
  
      res.json(metadata);
    } catch (error) {
      console.error('Error fetching client metadata:', error);
      res.status(500).json({ error: 'Error fetching client metadata' });
    }
  };
  