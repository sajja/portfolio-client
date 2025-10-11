// CSE API Service for fetching market announcements
class CSEService {
  static BASE_URL = '/api/cse';

  /**
   * Fetch CSE announcements for a given date range and categories
   * @param {string} fromDate - Start date in YYYY-MM-DD format
   * @param {string[]} categories - Array of announcement categories
   * @param {boolean} allCompanies - Whether to fetch for all companies
   * @returns {Promise<Object>} API response data
   */
  static async fetchAnnouncements(fromDate, categories = ['DEALINGS BY DIRECTORS'], allCompanies = true) {
    try {
      const requestData = {
        fromDate,
        allCompanies,
        categories
      };

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en',
          'content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching CSE announcements:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed announcement by ID
   * @param {string|number} announcementId - The announcement ID
   * @returns {Promise<Object>} Detailed announcement data
   */
  static async getAnnouncementById(announcementId) {
    try {
      const response = await fetch('/api/cse/details', {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `announcementId=${announcementId}`
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching announcement details:', error);
      throw error;
    }
  }

  /**
   * Get recent announcements (last 7 days)
   * @returns {Promise<Object>} Recent announcements
   */
  static async getRecentAnnouncements() {
    const today = new Date();
    // Set to start of day to avoid time zone issues
    today.setHours(0, 0, 0, 0);
    
    // Calculate 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // Format as YYYY-MM-DD
    const fromDate = sevenDaysAgo.getFullYear() + '-' + 
                     String(sevenDaysAgo.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(sevenDaysAgo.getDate()).padStart(2, '0');
    
    return this.fetchAnnouncements(fromDate);
  }

  /**
   * Get today's announcements
   * @returns {Promise<Object>} Today's announcements
   */
  static async getTodaysAnnouncements() {
    const today = new Date().toISOString().split('T')[0];
    return this.fetchAnnouncements(today);
  }

  /**
   * Format CSE announcement into notification format
   * @param {Object} announcement - Raw CSE announcement data
   * @returns {Object} Formatted notification object
   */
  static formatAnnouncementAsNotification(announcement) {
    const {
      id,
      company,
      symbol,
      dircetorsName,
      natureOfDir,
      dateOfAnnouncement,
      remarks,
      transactionType,
      createdDate
    } = announcement;

    // Determine notification priority based on transaction type
    const getPriority = (transactionType) => {
      switch (transactionType?.toLowerCase()) {
        case 'sale':
          return 'warning';
        case 'purchase':
        case 'buy':
          return 'success';
        default:
          return 'info';
      }
    };

    // Create a user-friendly title
    const title = `${transactionType || 'Transaction'} by Director - ${company}`;

    // Create detailed message
    const message = `${dircetorsName} (${natureOfDir}) ${transactionType?.toLowerCase() || 'conducted a transaction'} in ${company} (${symbol}). ${remarks || ''}`;

    return {
      id: `cse_${id}`,
      type: 'market',
      title,
      message,
      timestamp: this.parseCSEDate(createdDate || dateOfAnnouncement),
      read: false,
      priority: getPriority(transactionType),
      source: 'CSE',
      rawData: announcement
    };
  }

  /**
   * Parse CSE date format to ISO string
   * @param {string} dateStr - Date in CSE format (DD-MM-YYYY or DD-MM-YYYY HH:mm:ss AM/PM)
   * @returns {string} ISO date string
   */
  static parseCSEDate(dateStr) {
    if (!dateStr) return new Date().toISOString();

    try {
      // Handle both date formats from CSE
      if (dateStr.includes(' ')) {
        // Format: "08-10-2025 05:19:56 PM"
        const [datePart, timePart, ampm] = dateStr.split(' ');
        const [day, month, year] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        
        let hour24 = parseInt(hours);
        if (ampm === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (ampm === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        const date = new Date(year, month - 1, day, hour24, minutes, seconds);
        return date.toISOString();
      } else {
        // Format: "08-10-2025"
        const [day, month, year] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        return date.toISOString();
      }
    } catch (error) {
      console.error('Error parsing CSE date:', dateStr, error);
      return new Date().toISOString();
    }
  }

  /**
   * Get all available announcement categories
   * @returns {string[]} Array of category names
   */
  static getAvailableCategories() {
    return [
      'DEALINGS BY DIRECTORS',
      'FINANCIAL STATEMENTS',
      'DIVIDENDS',
      'RIGHTS ISSUES',
      'BONUS ISSUES',
      'MEETINGS',
      'GENERAL ANNOUNCEMENTS'
    ];
  }
}

export default CSEService;