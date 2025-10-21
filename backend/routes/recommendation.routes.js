import express from 'express';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// 🔹 Recommend providers/freelancers for a job/project
router.get('/providers/:jobId', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Build search keywords from job details
    const keywords = [
      job.title,
      job.description,
      job.category
    ].join(' ');

    // Find matching providers using text search
    const providers = await User.find({
      role: 'provider',
      isActive: true,
      $or: [
        { $text: { $search: keywords } },
        { skills: { $in: [job.category] } },
        { services: { $in: [job.category] } },
        { preferredCategories: { $in: [job.category] } },
        { providerType: job.providerType }
      ]
    })
    .select('-password')
    .lean();

    // Calculate match score for each provider
    const scoredProviders = providers.map(provider => {
      let score = 0;
      
      // Score based on text match (if text search was used)
      if (provider.score) {
        score += provider.score * 10;
      }
      
      // Bonus for matching provider type
      if (provider.providerType === job.providerType) {
        score += 20;
      }
      
      // Bonus for matching skills
      const matchingSkills = provider.skills?.filter(skill => 
        keywords.toLowerCase().includes(skill.toLowerCase()) ||
        job.category.toLowerCase().includes(skill.toLowerCase())
      ) || [];
      score += matchingSkills.length * 15;
      
      // Bonus for matching services
      const matchingServices = provider.services?.filter(service => 
        keywords.toLowerCase().includes(service.toLowerCase()) ||
        job.category.toLowerCase().includes(service.toLowerCase())
      ) || [];
      score += matchingServices.length * 15;
      
      // Bonus for verification status
      if (provider.verification?.status === 'verified') {
        score += 25;
      }
      
      // Bonus for demo verification
      if (provider.demoVerification?.status === 'verified') {
        score += 20;
        // Additional bonus based on demo score
        if (provider.demoVerification.score) {
          score += (provider.demoVerification.score / 10) * 5;
        }
      }
      
      // Rating bonus
      if (provider.rating) {
        score += provider.rating * 10;
      }
      
      // Experience bonus (completed jobs)
      if (provider.completedJobs) {
        score += Math.min(provider.completedJobs * 2, 30);
      }
      
      // Location match bonus
      if (provider.city?.toLowerCase() === job.location.city?.toLowerCase()) {
        score += 15;
      }
      
      return {
        ...provider,
        matchScore: Math.round(score),
        matchReason: {
          skills: matchingSkills,
          services: matchingServices,
          verified: provider.verification?.status === 'verified',
          demoVerified: provider.demoVerification?.status === 'verified',
          rating: provider.rating || 0,
          completedJobs: provider.completedJobs || 0
        }
      };
    });

    // Sort by match score and limit results
    const recommendedProviders = scoredProviders
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      count: recommendedProviders.length,
      jobTitle: job.title,
      jobCategory: job.category,
      data: recommendedProviders
    });

  } catch (error) {
    console.error('Error recommending providers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recommendations',
      error: error.message 
    });
  }
});

// 🔹 Recommend jobs/projects for a provider/freelancer
router.get('/jobs/:providerId', authenticate, async (req, res) => {
  try {
    const provider = await User.findById(req.params.providerId);
    
    if (!provider) {
      return res.status(404).json({ 
        success: false,
        message: 'Provider not found' 
      });
    }

    if (provider.role !== 'provider') {
      return res.status(400).json({ 
        success: false,
        message: 'User is not a provider' 
      });
    }

    // Build search keywords from provider's skills and services
    const keywords = [
      ...(provider.skills || []),
      ...(provider.services || []),
      ...(provider.preferredCategories || [])
    ].join(' ');

    // Find matching jobs using text search
    let matchingJobs = await Job.find({
      status: 'open',
      isActive: true,
      $or: [
        { $text: { $search: keywords } },
        { category: { $in: provider.skills || [] } },
        { category: { $in: provider.services || [] } },
        { category: { $in: provider.preferredCategories || [] } },
        { providerType: provider.providerType }
      ]
    })
    .populate('client', 'fullName city rating')
    .sort({ createdAt: -1 })
    .lean();

    // Calculate match score for each job
    const scoredJobs = matchingJobs.map(job => {
      let score = 0;
      
      // Score based on text match
      if (job.score) {
        score += job.score * 10;
      }
      
      // Bonus for matching provider type
      if (job.providerType === provider.providerType) {
        score += 25;
      }
      
      // Bonus for matching skills
      const matchingSkills = provider.skills?.filter(skill => 
        job.title.toLowerCase().includes(skill.toLowerCase()) ||
        job.description.toLowerCase().includes(skill.toLowerCase()) ||
        job.category.toLowerCase().includes(skill.toLowerCase())
      ) || [];
      score += matchingSkills.length * 20;
      
      // Bonus for matching services
      const matchingServices = provider.services?.filter(service => 
        job.title.toLowerCase().includes(service.toLowerCase()) ||
        job.description.toLowerCase().includes(service.toLowerCase()) ||
        job.category.toLowerCase().includes(service.toLowerCase())
      ) || [];
      score += matchingServices.length * 20;
      
      // Bonus for matching category
      if (provider.skills?.includes(job.category) || 
          provider.services?.includes(job.category) ||
          provider.preferredCategories?.includes(job.category)) {
        score += 30;
      }
      
      // Location match bonus
      if (provider.city?.toLowerCase() === job.location.city?.toLowerCase()) {
        score += 20;
      }
      
      // Budget compatibility (if hourly rate is set)
      if (provider.hourlyRate && job.budgetType === 'hourly') {
        if (job.budget >= provider.hourlyRate) {
          score += 15;
        }
      }
      
      // Newer jobs get slight bonus
      const jobAge = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (jobAge < 1) score += 10; // Posted today
      else if (jobAge < 3) score += 5; // Posted in last 3 days
      
      return {
        ...job,
        matchScore: Math.round(score),
        matchReason: {
          skills: matchingSkills,
          services: matchingServices,
          categoryMatch: provider.skills?.includes(job.category) || 
                        provider.services?.includes(job.category),
          locationMatch: provider.city?.toLowerCase() === job.location.city?.toLowerCase(),
          budgetCompatible: provider.hourlyRate ? (job.budget >= provider.hourlyRate) : true
        }
      };
    });

    // Sort by match score and limit results
    const recommendedJobs = scoredJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      count: recommendedJobs.length,
      providerName: provider.fullName,
      providerSkills: provider.skills || [],
      data: recommendedJobs
    });

  } catch (error) {
    console.error('Error recommending jobs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recommendations',
      error: error.message 
    });
  }
});

// 🔹 Get personalized recommendations for current user
router.get('/for-me', authenticate, async (req, res) => {
  try {
    const user = req.user;

    if (user.role === 'provider') {
      // Redirect to jobs recommendation
      const provider = await User.findById(user._id);
      
      const keywords = [
        ...(provider.skills || []),
        ...(provider.services || []),
        ...(provider.preferredCategories || [])
      ].join(' ');

      const jobs = await Job.find({
        status: 'open',
        isActive: true,
        $or: [
          { category: { $in: provider.skills || [] } },
          { category: { $in: provider.services || [] } },
          { providerType: provider.providerType }
        ]
      })
      .populate('client', 'fullName city rating')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

      res.status(200).json({
        success: true,
        userType: 'provider',
        count: jobs.length,
        data: jobs
      });

    } else if (user.role === 'client') {
      // Get client's recent jobs and recommend providers
      const recentJobs = await Job.find({ 
        client: user._id 
      })
      .sort({ createdAt: -1 })
      .limit(5);

      if (recentJobs.length === 0) {
        return res.status(200).json({
          success: true,
          userType: 'client',
          count: 0,
          message: 'Post a job to get provider recommendations',
          data: []
        });
      }

      // Get categories from recent jobs
      const categories = [...new Set(recentJobs.map(job => job.category))];
      
      const providers = await User.find({
        role: 'provider',
        isActive: true,
        $or: [
          { skills: { $in: categories } },
          { services: { $in: categories } },
          { preferredCategories: { $in: categories } }
        ]
      })
      .select('-password')
      .sort({ rating: -1, completedJobs: -1 })
      .limit(10)
      .lean();

      res.status(200).json({
        success: true,
        userType: 'client',
        count: providers.length,
        data: providers
      });

    } else {
      res.status(400).json({
        success: false,
        message: 'Recommendations not available for admin users'
      });
    }

  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recommendations',
      error: error.message 
    });
  }
});

export default router;
