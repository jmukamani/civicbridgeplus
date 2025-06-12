import * as smsService from '../services/smsService.js';

export const sendSMS = async (req, res) => {
  try {
    const { phone, message } = req.body;
    const result = await smsService.sendSMS(phone, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send SMS' });
  }
};

export const getSMSBalance = async (req, res) => {
  try {
    const balance = await smsService.getBalance();
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get SMS balance' });
  }
};