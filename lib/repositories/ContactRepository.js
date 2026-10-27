import { BaseRepository } from "./BaseRepository.js";

export class ContactRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "contact_submissions");
  }

  /**
   * Insert a new contact submission
   * @param {Object} data 
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} [data.inquiry_type]
   * @param {string} data.message
   */
  async createSubmission(data) {
    const { name, email, inquiry_type = "general", message } = data;
    
    await this.adapter.execute(
      `INSERT INTO contact_submissions (name, email, inquiry_type, message)
       VALUES (?, ?, ?, ?)`,
      [name, email, inquiry_type || "general", message]
    );

    return { success: true };
  }

  async saveSubmission(data) {
    return this.createSubmission(data);
  }
}
