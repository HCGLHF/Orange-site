import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ContactCard() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="contact"
      className="bg-brand-cream px-6 py-16"
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.35 }}
      variants={reduceMotion ? undefined : staggerContainer}
    >
      <div className="mx-auto max-w-4xl">
        <motion.div variants={reduceMotion ? undefined : fadeUp} className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold text-brand-charcoal">联系我们 / Contact</h2>
          <p className="text-gray-600">绍兴诗橙纺织品有限公司 · 无论您有任何面料需求，我们随时为您服务</p>
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : staggerContainer} className="grid gap-6 md:grid-cols-2">
          <motion.a
            variants={reduceMotion ? undefined : fadeUp}
            href="mailto:folenchen0401@outlook.com?subject=面料询盘&body=您好，我对贵司面料感兴趣..."
            className="group flex items-center space-x-4 rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10 transition-colors group-hover:bg-brand-orange group-hover:text-white">
              <Mail className="h-6 w-6 text-brand-orange group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal">发送邮件</h3>
              <p className="font-medium text-brand-orange">folenchen0401@outlook.com</p>
              <p className="mt-1 text-sm text-gray-500">点击直接发送邮件</p>
            </div>
          </motion.a>

          <motion.a
            variants={reduceMotion ? undefined : fadeUp}
            href="https://wa.me/8613867557317"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center space-x-4 rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 transition-colors group-hover:bg-green-500 group-hover:text-white">
              <MessageCircle className="h-6 w-6 text-green-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal">WhatsApp</h3>
              <p className="font-medium text-green-600">+86 13867557317</p>
              <p className="mt-1 text-sm text-gray-500">点击直接对话</p>
            </div>
          </motion.a>

          <motion.a
            variants={reduceMotion ? undefined : fadeUp}
            href="tel:+8613867550307"
            className="group flex items-center space-x-4 rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 transition-colors group-hover:bg-blue-500 group-hover:text-white">
              <Phone className="h-6 w-6 text-blue-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal">电话咨询</h3>
              <p className="font-medium text-blue-600">
                +86 13867550307 / +86 13867557317 / +86 13989587635
              </p>
              <p className="mt-1 text-sm text-gray-500">工作日 9:00-18:00</p>
            </div>
          </motion.a>

          <motion.div
            variants={reduceMotion ? undefined : fadeUp}
            className="group flex items-center space-x-4 rounded-3xl bg-white p-8 shadow-sm"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal">公司地址</h3>
              <p className="font-medium text-gray-700">浙江绍兴</p>
              <p className="mt-1 text-sm text-gray-500">中国</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={reduceMotion ? undefined : fadeUp}
          className="mt-8 rounded-2xl bg-white/50 p-4 text-center text-sm text-gray-500"
        >
          <p>💡 提示：如果表单提交失败，请直接点击上方邮箱或WhatsApp联系我们</p>
        </motion.div>
      </div>
    </motion.section>
  );
}
