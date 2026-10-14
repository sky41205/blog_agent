const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Blog = require('../models/Blog');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const blogs = await Blog.find({ status: { $in: ['PUBLISHED', 'Published', 'published'] } })
    .select('title slug featuredImage contentMarkdown createdAt')
    .sort({ createdAt: -1 })
    .limit(10);
  console.log('Total published blogs found:', blogs.length);
  blogs.forEach((b, i) => {
    console.log(`[${i+1}] Title: ${b.title}`);
    console.log(`     Image URL: ${b.featuredImage?.url}`);
    console.log(`     Content Chars: ${b.contentMarkdown?.length || 0}, Words: ${(b.contentMarkdown || '').split(/\s+/).filter(Boolean).length}`);
  });
  await mongoose.disconnect();
}
check().catch(console.error);
