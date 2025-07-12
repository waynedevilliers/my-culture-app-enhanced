import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa6";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Director, Cultural Arts Center",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b142?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      content: "This platform has transformed how we recognize our participants' achievements. The certificate templates are absolutely beautiful and professional.",
      rating: 5
    },
    {
      name: "Miguel Rodriguez",
      role: "Founder, Heritage Foundation",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      content: "The ease of use and the variety of templates have made certificate generation so much more efficient for our organization.",
      rating: 5
    },
    {
      name: "Dr. Amelia Chen",
      role: "Academic Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      content: "Our students love sharing their certificates on social media. The professional design really makes them proud of their achievements.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            What Our 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-3">
              Community Says
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from organizations that are already transforming their recognition programs
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-primary/20">
                <FaQuoteLeft className="text-3xl" />
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <a
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Start Your Success Story
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;