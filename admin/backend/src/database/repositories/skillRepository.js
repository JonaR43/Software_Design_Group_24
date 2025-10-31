/**
 * Skill Repository
 * Handles all database operations for skills
 */

const prisma = require('../prisma');

class SkillRepository {
  /**
   * Get all skills
   */
  async findAll() {
    return await prisma.skill.findMany({
      orderBy: {
        category: 'asc'
      }
    });
  }

  /**
   * Find skill by ID
   */
  async findById(skillId) {
    return await prisma.skill.findUnique({
      where: { id: skillId }
    });
  }

  /**
   * Find skill by name
   */
  async findByName(name) {
    return await prisma.skill.findUnique({
      where: { name }
    });
  }

  /**
   * Search skills by name
   */
  async searchByName(query, category = null) {
    const where = {
      name: {
        contains: query,
        mode: 'insensitive'
      }
    };

    if (category) {
      where.category = category;
    }

    return await prisma.skill.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Get skills by category
   */
  async findByCategory(category) {
    return await prisma.skill.findMany({
      where: { category },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Create new skill
   */
  async create(skillData) {
    return await prisma.skill.create({
      data: {
        name: skillData.name,
        category: skillData.category,
        description: skillData.description || null
      }
    });
  }

  /**
   * Update skill
   */
  async update(skillId, updateData) {
    return await prisma.skill.update({
      where: { id: skillId },
      data: updateData
    });
  }

  /**
   * Delete skill
   */
  async delete(skillId) {
    return await prisma.skill.delete({
      where: { id: skillId }
    });
  }

  /**
   * Get unique skill categories
   */
  async getCategories() {
    const skills = await prisma.skill.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    return skills.map(s => s.category).sort();
  }

  /**
   * Get skills grouped by category
   */
  async getSkillsGroupedByCategory() {
    const skills = await this.findAll();

    const grouped = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });

    return grouped;
  }
}

module.exports = new SkillRepository();
