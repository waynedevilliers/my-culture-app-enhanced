import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    { number: 1000, suffix: "+", label: "Certificates Issued", duration: 2000 },
    { number: 50, suffix: "+", label: "Organizations", duration: 1500 },
    { number: 25, suffix: "+", label: "Countries", duration: 1800 },
    { number: 99, suffix: "%", label: "Satisfaction Rate", duration: 2200 }
  ];

  const AnimatedNumber = ({ targetNumber, duration, suffix }) => {
    const [number, setNumber] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let startTime;
      const animateNumber = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentNumber = Math.floor(progress * targetNumber);
        setNumber(currentNumber);

        if (progress < 1) {
          requestAnimationFrame(animateNumber);
        }
      };

      requestAnimationFrame(animateNumber);
    }, [isVisible, targetNumber, duration]);

    return (
      <span className="text-4xl md:text-5xl font-bold text-white">
        {number.toLocaleString()}{suffix}
      </span>
    );
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          onViewportEnter={() => setIsVisible(true)}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of organizations already transforming their recognition programs
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-2">
                <AnimatedNumber 
                  targetNumber={stat.number} 
                  duration={stat.duration}
                  suffix={stat.suffix}
                />
              </div>
              <p className="text-white/80 text-lg font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;