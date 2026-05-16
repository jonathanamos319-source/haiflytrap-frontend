import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqData = [
  {
    question: "Is Haifly Trap safe for my family and pets?",
    answer: "Yes, absolutely! Our products, including the Broadkiller Surface Spray, are formulated with a 100% botanical, non-toxic, and odourless base. They are specifically designed to be safe around humans, dogs, cats, rabbits, and even horses."
  },
  {
    question: "How long does the Broadkiller spray remain effective?",
    answer: "Broadkiller provides instant elimination on contact and continues to protect your surfaces for several days. Because it is water-based and non-volatile, it stays where you spray it without releasing toxic fumes into the air."
  },
  {
    question: "Do you deliver to locations outside of Lagos?",
    answer: "Yes, we deliver nationwide. We offer same-day delivery within the Lagos metropolis, and 24-48 hours delivery to other states across Nigeria."
  },
  {
    question: "What makes Haifly Trap different from other brands?",
    answer: "Haifly Trap pioneered Nigeria's first commercially viable housefly trap and the world's first anti-maggot solution. Our products are odourless, botanical, and effective, offering a premium alternative to harsh chemical insecticides."
  },
  {
    question: "Can I use the Broadkiller spray on my indoor plants?",
    answer: "Yes, our formula is gentle enough to be used on and around plants. It effectively manages houseflies without harming your greenery, making it ideal for both indoor gardens and outdoor landscaping."
  },
  {
    question: "Is Haifly Trap suitable for stables and horses?",
    answer: "Yes, Haifly Trap is ideal for stables and equestrian environments. Our botanical formula is 100% safe for horses and effectively controls stable flies and mosquitoes without the use of harsh chemicals that could irritate sensitive animals."
  },
  {
    question: "Do you provide solutions for hotels, lounges, and restaurants?",
    answer: "Absolutely. We specialize in premium housefly control for hospitality and commercial spaces. Our odourless, non-toxic solutions allow you to maintain a fly-free environment in lounges, hotel lobbies, and dining areas without any disruptive chemical smells or safety concerns for your guests."
  },
  {
    question: "Is Haifly Trap only for houseflies?",
    answer: "While Haifly Trap is specifically engineered as a premium solution for housefly control, its botanical formula is also highly effective against other flying and crawling insects like mosquitoes, cockroaches, and bedbugs. However, our primary mission remains providing the most effective, eco-friendly defense against houseflies in Nigeria."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedFaqs = isExpanded ? faqData : faqData.slice(0, 3);

  return (
    <section className="py-6 md:py-8 bg-surface relative overflow-hidden">
      <div className="section-padding">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            
            {/* Left: Illustration */}
            <div className="flex-1 w-full max-w-md lg:max-w-none order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-fresh/5 rounded-full blur-3xl -z-10" />
                <img 
                  src="/reading-a-book (1).svg" 
                  alt="FAQ Illustration" 
                  width="400"
                  height="400"
                  loading="lazy"
                  className="w-full h-auto drop-shadow-2xl animate-bounce-subtle"
                />
              </div>
            </div>

            {/* Right: FAQ Content */}
            <div className="flex-1 w-full order-1 lg:order-2">
              <div className="mb-6 text-center lg:text-left">
                <span className="label-sm mb-3 block text-fresh">QUESTIONS & ANSWERS</span>
                <h2 className="text-3xl md:text-5xl font-display font-black text-forest mb-4">
                  Frequently Asked <span className="text-gold">Questions</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl">
                  Everything you need to know about our botanical housefly control solutions.
                </p>
              </div>

              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-2xl border transition-all duration-300 ${openIndex === index ? 'border-fresh shadow-md' : 'border-outline-variant'} ${(!isExpanded && index >= 3) ? 'hidden lg:block' : 'block'}`}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 no-anim"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className={`w-5 h-5 ${openIndex === index ? 'text-fresh' : 'text-muted-foreground'}`} />
                        <span className={`font-bold text-base md:text-lg ${openIndex === index ? 'text-forest' : 'text-forest/80'}`}>
                          {faq.question}
                        </span>
                      </div>
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-fresh shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    
                    {openIndex === index && (
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-px bg-outline-variant mb-4" />
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {!isExpanded && faqData.length > 3 && (
                  <button 
                    onClick={() => setIsExpanded(true)}
                    className="lg:hidden w-full py-4 text-fresh font-bold hover:bg-fresh/5 rounded-2xl border-2 border-dashed border-fresh/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>See More Questions</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
