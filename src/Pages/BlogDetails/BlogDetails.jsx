import React from "react";
import { Link, ScrollRestoration } from "react-router-dom";


import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import BlogSidebar from "../../Components/Blogs/BlogSidebar";

import bblog1 from "../../assets/img/blog/bblog1.png";
import blogDetailsb2 from "../../assets/img/blog/blog-detailsb2.png";
import straightQuotes from "../../assets/img/blog/straight-quotes.png";
import Form from "../../Components/Shared/Form/Form";
import { socialIcons } from "../../Utlits/socilIcons";

const BlogDetails = () => {

  return (
    <>
      <PageHeader
        heading={"Brand design that helps the company grow"}
        page={"Brand design that helps the company grow"}
      />
      <section className="blog__bsection pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="blog__bleft__wrapper">
                <div
                  className="blog__bitem"
                  data-aos="fade-up"
                  data-aos-duration="1000"
                >
                  <Link to="" className="thumb">
                    <img src={bblog1} alt="img" />
                  </Link>
                  <div className="content__two">
                    <div
                      className="text__box mb-30"
                      data-aos="fade-up"
                      data-aos-duration="1400"
                    >
                      <span className="text__de">
                        By: admin / Lifestyle / Posted on September 19, 2025 /
                        Comments: 0
                      </span>
                      <p className="fz-16 pra ttext__one">
                        From my perspective, branding is not just about visuals, 
                        it’s about defining who you are and why you exist. 
                        It starts with uncovering the real mission behind your 
                        business: your philosophy, your story, and the emotion 
                        that drives your work. When that clarity is translated 
                        into a consistent identity, your brand stops being 
                        decoration and becomes direction.
                      </p>
                      <p className="fz-16 pra">
                        Authenticity is what makes a brand truly valuable.
                        Today’s audiences, and even the algorithms, recognize 
                        sincerity. They reward it with engagement, trust, and 
                        loyalty. When your design and message speak from the 
                        same truth, everything else aligns naturally.
                      </p>
                    </div>
                    <div className="quite__box mb-30">
                      <img src={straightQuotes} alt="img" />
                      <p>
                        Your brand is what other people say about you when
                        you’re not in the room.
                      </p>
                      <Link to="">Jeff Bezos</Link>
                    </div>
                    <p className="fz-16 pra ttext__one mb__cus60">
                      Good branding is like the umami of business, subtle but 
                      unforgettable. It’s the perfect balance between what you 
                      show and what you stand for. Every ad, video, and web 
                      experience should be part of the same recipe, one that 
                      reflects the heart of your company and the value you bring 
                      to others. That’s how marketing stops feeling forced and 
                      starts feeling human.
                    </p>
                    <h3 className="white mb-30">
                      Branding made for NF Autoparts Corporations, LLC.
                    </h3>
                    <div className="thumb mb-30">
                      <img src={blogDetailsb2} alt="img" />
                    </div>
                    <p className="fz-16 pra ttext__one mb-30">
                      When design, motion, ads, and strategy work together, 
                      growth stops being an accident and becomes a process. 
                      It’s not just about aesthetics or metrics; it’s about 
                      building a digital presence that sells with purpose. 
                      The brands that understand this are the ones that last, 
                      because they grow from within.
                    </p>
                    <h3 className="white mb-30">
                      Key Takeaways:
                    </h3>
                    <div
                      className="text__box mb-30"
                      data-aos="fade-up"
                      data-aos-duration="1600"
                    >
                      <ul className="challenge__list">
                        <li>
                          Authentic branding builds trust before conversion.
                        </li>
                        <li>
                          A clear digital identity enhances ad performance and ROI.
                        </li>
                        <li>
                          Consistency across design, content, and tone creates recognition.
                        </li>
                        <li>
                          Strategy without authenticity is noise; authenticity without strategy is silence.
                        </li>
                      </ul>
                    </div>
                    <p className="fz-16 pra ttext__one mb-30">
                      Want to take your brand to the next level? 
                      Explore more insights on my blog or book a 
                      session with me to start building a brand 
                      that truly sells.
                    </p>
                  </div>
                  <div className="post__in cmn__bg mb__cus60">
                    <div className="post__left">
                      <span className="fz-20 fw-500 white">Posted in :</span>
                      <Link to="">Business</Link>
                      <Link to="">Digital</Link>
                    </div>
                    <div className="post__right">
                      <span className="fz-20 fw-500 white">Share :</span>
                      <ul className="social-cus d-flex align-items-center">
                        {socialIcons.map(({id, icon}) => (
                          <li key={id}>
                            <Link to="">
                              <i>
                                {icon}
                              </i>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Form isColTwo={true} />
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>
      <ScrollRestoration />
    </>
  );
};

export default BlogDetails;
