import { FaAngleDown } from "react-icons/fa6";
import { Link } from "react-scroll";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center px-4">
      <div className="absolute"></div>

      <motion.div
        className="relative z-10 text-center text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h1 className="text-6xl font-extrabold mb-4 tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Grow
        </h1>
        <h2 className="text-5xl  mt-2 text-gray-600 tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          1000 Rewards
        </h2>
        <h2 className="text-4xl  mt-2 text-gray-600 tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Making the World a Better Place
        </h2>
        <h2 className="text-4xl mt-2 text-gray-600 tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Since 2025
        </h2>
      </motion.div>

      <div className="absolute bottom-10 bounce text-gray-300 text-5xl cursor-pointer hover:text-base-100">
        <Link
          to="/organizations"
          spy={true}
          smooth={true}
          offset={-50}
          duration={500}
        >
          <FaAngleDown />
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
