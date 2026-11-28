import { motion } from "framer-motion";
import { FaCertificate, FaUsers, FaChartLine, FaGlobe, FaShield, FaRocket } from "react-icons/fa6";

const FeaturesSection = () => {
  const features = [
    {
      icon: FaCertificate,
      title: "Beautiful Certificates",
      description: "5 professional certificate templates to choose from, each designed for different occasions and styles."
    },
    {
      icon: FaUsers,
      title: "Community Driven",
      description: "Join a growing community of cultural organizations from around the world."
    },
    {
      icon: FaChartLine,
      title: "Track Progress",
      description: "Monitor achievements and progress with comprehensive analytics and reporting."
    },
    {
      icon: FaGlobe,
      title: "Global Reach",
      description: "Connect with participants and organizations across 25+ countries worldwide."
    },
    {
      icon: FaShield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security ensures your data and certificates are always protected."
    },
    {
      icon: FaRocket,
      title: "Easy Setup",
      description: "Get started in minutes with our intuitive interface and guided setup process."
    }
  ];

  return (
    <section className="py-20 px-4">
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
            Why Choose 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-3">
              Our Platform?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to recognize achievements and build stronger cultural communities
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 ml-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;