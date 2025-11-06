const { skillHelpers } = require('../data/skills');

/**
 * Volunteer Matching Algorithm
 * Implements weighted scoring system for volunteer-to-event matching
 */
class MatchingAlgorithm {
  constructor() {
    // Matching weights - prioritizing location to avoid distant volunteers
    this.weights = {
      location: 0.35,      // 35% - Distance proximity (increased to penalize distant volunteers)
      skills: 0.30,        // 30% - Skill alignment
      availability: 0.25,  // 25% - Schedule compatibility
      preferences: 0.10,   // 10% - Personal preferences
      reliability: 0.05    // 5% - Volunteer history/reliability
    };

    // Proficiency value mapping (support both lowercase and uppercase)
    this.proficiencyValues = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
      BEGINNER: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3,
      EXPERT: 4
    };
  }

  /**
   * Calculate comprehensive match score between volunteer and event
   * @param {Object} volunteer - Volunteer data with profile
   * @param {Object} event - Event data with requirements
   * @returns {Object} Match result with score and breakdown
   */
  calculateMatchScore(volunteer, event) {
    try {
      const scores = {
        location: this.calculateLocationScore(volunteer.profile, event),
        skills: this.calculateSkillsScore(volunteer.profile, event),
        availability: this.calculateAvailabilityScore(volunteer.profile, event),
        preferences: this.calculatePreferencesScore(volunteer.profile, event),
        reliability: this.calculateReliabilityScore(volunteer)
      };

      // Calculate weighted total score
      const totalScore = Math.round(
        (scores.location * this.weights.location) +
        (scores.skills * this.weights.skills) +
        (scores.availability * this.weights.availability) +
        (scores.preferences * this.weights.preferences) +
        (scores.reliability * this.weights.reliability)
      );

      // Generate recommendations based on scores
      const recommendations = this.generateRecommendations(scores, volunteer, event);

      return {
        volunteerId: volunteer.id,
        eventId: event.id,
        totalScore: Math.min(totalScore, 100), // Cap at 100
        scoreBreakdown: scores,
        weights: this.weights,
        recommendations,
        matchQuality: this.getMatchQuality(totalScore),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating match score:', error);
      return {
        volunteerId: volunteer.id,
        eventId: event.id,
        totalScore: 0,
        error: error.message,
        calculatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate location proximity score (0-100)
   * @param {Object} profile - Volunteer profile
   * @param {Object} event - Event data
   * @returns {number} Location score
   */
  calculateLocationScore(profile, event) {
    // If either location is missing, return default score
    if (!profile.latitude || !profile.longitude || !event.latitude || !event.longitude) {
      return 50; // Default neutral score
    }

    const distance = this.calculateDistance(
      profile.latitude,
      profile.longitude,
      event.latitude,
      event.longitude
    );

    // Score decreases by 2 points per kilometer, with bonus for very close distances
    let score = 100 - (distance * 2);

    // Bonus for very close distances (within 5km)
    if (distance <= 5) {
      score += 10;
    }

    // Apply volunteer's maximum distance preference
    if (profile.preferences && profile.preferences.maxDistance) {
      if (distance > profile.preferences.maxDistance) {
        score = Math.max(score - 30, 0); // Significant penalty for exceeding preferred distance
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate skills alignment score (0-100)
   * @param {Object} profile - Volunteer profile
   * @param {Object} event - Event data
   * @returns {number} Skills score
   */
  calculateSkillsScore(profile, event) {
    // If no skills required, return perfect score
    if (!event.requirements || event.requirements.length === 0) {
      return 100;
    }

    // If volunteer has no skills, return 0
    if (!profile.skills || profile.skills.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let maxPossibleScore = 0;
    let requiredSkillsMatched = 0;
    let requiredSkillsTotal = event.requirements.filter(rs => rs.isRequired).length;

    for (const requiredSkill of event.requirements) {
      const requiredValue = this.proficiencyValues[requiredSkill.minLevel] || 1;
      const skillWeight = requiredSkill.isRequired ? 2 : 1; // Weight required skills more heavily

      maxPossibleScore += requiredValue * skillWeight;

      const volunteerSkill = profile.skills.find(vs => vs.skillId === requiredSkill.skillId);

      if (volunteerSkill) {
        const volunteerValue = this.proficiencyValues[volunteerSkill.proficiency] || 1;

        // Calculate skill score based on proficiency match
        const proficiencyRatio = Math.min(volunteerValue / requiredValue, 1.5); // Allow bonus for exceeding requirement
        const skillScore = proficiencyRatio * requiredValue * skillWeight;

        totalScore += skillScore;

        // Track required skills coverage
        if (requiredSkill.isRequired) {
          requiredSkillsMatched++;
        }
      } else {
        // Penalty for missing skills
        if (requiredSkill.isRequired) {
          totalScore += 0; // No score for missing required skills
        } else {
          totalScore += requiredValue * skillWeight * 0.3; // Partial credit for missing optional skills
        }
      }
    }

    // Bonus for covering all required skills
    if (requiredSkillsTotal > 0 && requiredSkillsMatched === requiredSkillsTotal) {
      totalScore += 10; // Bonus points for covering all required skills
      maxPossibleScore += 10;
    }

    // Calculate percentage score
    const skillsScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 100;

    return Math.max(0, Math.min(100, Math.round(skillsScore)));
  }

  /**
   * Calculate availability overlap score (0-100)
   * @param {Object} profile - Volunteer profile
   * @param {Object} event - Event data
   * @returns {number} Availability score
   */
  calculateAvailabilityScore(profile, event) {
    // If no availability data, return default score
    if (!profile.availability || profile.availability.length === 0) {
      return 30; // Low default score for missing availability
    }

    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const eventDayOfWeek = eventStart.getDay(); // 0 = Sunday, 6 = Saturday
    const eventDateStr = eventStart.toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if volunteer is available on the event day (either specific date or recurring)
    const availableOnDay = profile.availability.some(slot => {
      // Check specific date availability
      if (!slot.isRecurring && slot.specificDate) {
        const slotDate = new Date(slot.specificDate);
        const slotDateStr = slotDate.toISOString().split('T')[0];
        return slotDateStr === eventDateStr;
      }

      // Check recurring availability
      if (slot.isRecurring && slot.dayOfWeek) {
        // Convert day name to number
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const slotDayOfWeek = dayNames.indexOf(slot.dayOfWeek);
        return slotDayOfWeek === eventDayOfWeek;
      }

      return false;
    });

    if (!availableOnDay) {
      return 0; // No availability on event day
    }

    // Find availability slots for the event day (both specific and recurring)
    const daySlots = profile.availability.filter(slot => {
      // Include specific date slots
      if (!slot.isRecurring && slot.specificDate) {
        const slotDate = new Date(slot.specificDate);
        const slotDateStr = slotDate.toISOString().split('T')[0];
        return slotDateStr === eventDateStr;
      }

      // Include recurring slots
      if (slot.isRecurring && slot.dayOfWeek) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const slotDayOfWeek = dayNames.indexOf(slot.dayOfWeek);
        return slotDayOfWeek === eventDayOfWeek;
      }

      return false;
    });

    let bestOverlap = 0;

    for (const slot of daySlots) {
      const overlap = this.calculateTimeOverlap(
        slot.startTime,
        slot.endTime,
        this.formatTime(eventStart),
        this.formatTime(eventEnd)
      );

      bestOverlap = Math.max(bestOverlap, overlap);
    }

    // Apply weekday preference if applicable
    let score = bestOverlap;
    if (profile.preferences && profile.preferences.weekdaysOnly) {
      const isWeekday = eventDayOfWeek >= 1 && eventDayOfWeek <= 5;
      if (!isWeekday) {
        score = Math.max(score - 30, 0); // Penalty for weekend events if weekdays preferred
      }
    }

    // Apply time slot preferences
    if (profile.preferences && profile.preferences.preferredTimeSlots) {
      const eventTimeSlot = this.getTimeSlot(eventStart);
      if (profile.preferences.preferredTimeSlots.includes(eventTimeSlot)) {
        score = Math.min(score + 15, 100); // Bonus for preferred time slots
      }
    }

    return Math.round(score);
  }

  /**
   * Calculate preferences alignment score (0-100)
   * @param {Object} profile - Volunteer profile
   * @param {Object} event - Event data
   * @returns {number} Preferences score
   */
  calculatePreferencesScore(profile, event) {
    // If no preferences set, return neutral score
    if (!profile.preferences) {
      return 50;
    }

    let score = 50; // Start with neutral score

    // Check cause alignment
    if (profile.preferences.causes && profile.preferences.causes.length > 0) {
      if (profile.preferences.causes.includes(event.category)) {
        score += 30; // Bonus for matching cause interest
      } else {
        score -= 15; // Slight penalty for non-matching cause
      }
    }

    // Check urgency preference (inferred from volunteer's past behavior)
    // For Assignment 3, we'll assume volunteers prefer normal urgency events
    switch (event.urgencyLevel) {
      case 'urgent':
        score += 10; // Bonus for helping with urgent needs
        break;
      case 'high':
        score += 5;
        break;
      case 'normal':
        score += 0; // Neutral
        break;
      case 'low':
        score -= 5; // Slight preference for more impactful events
        break;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate reliability score based on volunteer history (0-100)
   * @param {Object} volunteer - Volunteer data
   * @returns {number} Reliability score
   */
  calculateReliabilityScore(volunteer) {
    // For Assignment 3, we'll use simplified reliability scoring
    // In a real system, this would be based on actual participation history

    // Default score for new volunteers
    let score = 75;

    // Simple heuristic based on profile completeness and skills
    if (volunteer.profile) {
      // Bonus for complete profile
      if (volunteer.profile.firstName && volunteer.profile.lastName &&
          volunteer.profile.phone && volunteer.profile.address) {
        score += 10;
      }

      // Bonus for having skills
      if (volunteer.profile.skills && volunteer.profile.skills.length > 0) {
        score += 10;
      }

      // Bonus for availability setup
      if (volunteer.profile.availability && volunteer.profile.availability.length > 0) {
        score += 5;
      }
    }

    // Veteran volunteers (simplified identification)
    const accountAge = new Date() - new Date(volunteer.createdAt);
    const monthsOld = accountAge / (1000 * 60 * 60 * 24 * 30);

    if (monthsOld > 6) {
      score += 10; // Bonus for established volunteers
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate time overlap percentage between two time periods
   * @param {string} start1 - Start time 1 (HH:MM)
   * @param {string} end1 - End time 1 (HH:MM)
   * @param {string} start2 - Start time 2 (HH:MM)
   * @param {string} end2 - End time 2 (HH:MM)
   * @returns {number} Overlap percentage (0-100)
   */
  calculateTimeOverlap(start1, end1, start2, end2) {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    const overlapStart = Math.max(start1Minutes, start2Minutes);
    const overlapEnd = Math.min(end1Minutes, end2Minutes);

    if (overlapStart >= overlapEnd) {
      return 0; // No overlap
    }

    const overlapDuration = overlapEnd - overlapStart;
    const event2Duration = end2Minutes - start2Minutes;

    return Math.min(100, (overlapDuration / event2Duration) * 100);
  }

  /**
   * Convert time string to minutes since midnight
   * @param {string} time - Time in HH:MM format
   * @returns {number} Minutes since midnight
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format Date object to HH:MM string
   * @param {Date} date - Date object
   * @returns {string} Time in HH:MM format
   */
  formatTime(date) {
    return date.toTimeString().substring(0, 5);
  }

  /**
   * Get time slot category for a given date
   * @param {Date} date - Date object
   * @returns {string} Time slot (morning, afternoon, evening)
   */
  getTimeSlot(date) {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Generate recommendations based on match scores
   * @param {Object} scores - Score breakdown
   * @param {Object} volunteer - Volunteer data
   * @param {Object} event - Event data
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(scores, volunteer, event) {
    const recommendations = [];

    // Location recommendations
    if (scores.location < 50) {
      recommendations.push({
        type: 'location',
        priority: 'medium',
        message: 'This event is quite far from the volunteer\'s location. Consider local transportation options or remote participation if possible.'
      });
    }

    // Skills recommendations
    if (scores.skills < 60) {
      const missingSkills = this.findMissingSkills(volunteer.profile, event);
      if (missingSkills.length > 0) {
        recommendations.push({
          type: 'skills',
          priority: 'high',
          message: `Volunteer may need training in: ${missingSkills.join(', ')}. Consider providing skill development opportunities.`,
          missingSkills
        });
      }
    }

    // Availability recommendations
    if (scores.availability < 50) {
      recommendations.push({
        type: 'availability',
        priority: 'high',
        message: 'Limited availability overlap. Consider adjusting event timing or breaking into shorter shifts.'
      });
    }

    // Preferences recommendations
    if (scores.preferences < 40) {
      recommendations.push({
        type: 'preferences',
        priority: 'low',
        message: 'This event doesn\'t align strongly with volunteer\'s stated preferences. Emphasize impact and learning opportunities.'
      });
    }

    // Overall match recommendations
    const totalScore = (scores.location * this.weights.location) +
                      (scores.skills * this.weights.skills) +
                      (scores.availability * this.weights.availability) +
                      (scores.preferences * this.weights.preferences) +
                      (scores.reliability * this.weights.reliability);

    if (totalScore >= 80) {
      recommendations.push({
        type: 'overall',
        priority: 'info',
        message: 'Excellent match! This volunteer is highly suitable for this event.'
      });
    } else if (totalScore >= 60) {
      recommendations.push({
        type: 'overall',
        priority: 'info',
        message: 'Good match. Consider this volunteer for assignment with minor considerations.'
      });
    } else if (totalScore >= 40) {
      recommendations.push({
        type: 'overall',
        priority: 'medium',
        message: 'Moderate match. Review specific areas of concern before assignment.'
      });
    } else {
      recommendations.push({
        type: 'overall',
        priority: 'high',
        message: 'Poor match. Consider alternative volunteers or event modifications.'
      });
    }

    return recommendations;
  }

  /**
   * Find missing required skills for a volunteer
   * @param {Object} profile - Volunteer profile
   * @param {Object} event - Event data
   * @returns {Array} Array of missing skill names
   */
  findMissingSkills(profile, event) {
    if (!event.requirements || !event.requirements.length) {
      return [];
    }

    const volunteerSkillIds = profile.skills ? profile.skills.map(s => s.skillId) : [];
    const missingSkills = [];

    for (const requiredSkill of event.requirements) {
      if (requiredSkill.isRequired && !volunteerSkillIds.includes(requiredSkill.skillId)) {
        const skill = skillHelpers.findById(requiredSkill.skillId);
        if (skill) {
          missingSkills.push(skill.name);
        }
      }
    }

    return missingSkills;
  }

  /**
   * Get match quality description
   * @param {number} score - Total match score
   * @returns {string} Quality description
   */
  getMatchQuality(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Moderate';
    if (score >= 40) return 'Poor';
    return 'Very Poor';
  }
}

module.exports = new MatchingAlgorithm();