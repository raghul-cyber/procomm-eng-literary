const About = () => {
    return (
        <div style={{ padding: '4rem 2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="stranger-title" style={{ marginBottom: '4rem', textAlign: 'center' }}>About Us</h1>

            <div className="hawkins-container" style={{ maxWidth: '800px', width: '100%' }}>
                <section style={{ marginBottom: '4rem' }}>
                    <h2 className="stranger-section-title">
                        IEEE PROCOMM
                    </h2>
                    <p className="stranger-text" style={{ marginBottom: '1.5rem' }}>
                        The IEEE Professional Communication Society (IEEE ProComm) is a professional society of the IEEE. Its primary goals include helping engineers and technical writers to pursue further education and research in their fields, in addition to development of standards in technical communication. The society runs the annual IEEE International Professional Communication Conference, known as ProComm.
                    </p>
                    <p className="stranger-text">
                        The society states on its website that its field of interest includes "the study, preparation, production, delivery, use, improvement, and promotion of human communication in all media in engineering and other technical and professional environments". Its mission, related to this field, is to "foster a community dedicated to understanding and promoting effective communication in engineering, scientific, and other technical environments".
                    </p>
                </section>

                <section>
                    <h2 className="stranger-section-title">
                        ENGLISH LITERACY CLUB
                    </h2>
                    <p className="stranger-text" style={{ marginBottom: '1.5rem' }}>
                        The English Literacy Club (ELC) is a student-run organization that aims to enhance the English language skills of its members and the broader student community. The club typically organizes a range of activities, including workshops, seminars, reading groups, and cultural events, all designed to promote proficiency in English.
                    </p>
                    <p className="stranger-text">
                        The ELC provides a platform for students to practice their speaking, listening, reading, and writing skills in English through interactive sessions and peer-to-peer learning. By fostering a supportive environment, the English Literacy Club helps students improve their communication skills, which are essential for academic success and future career opportunities in a globalized world.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;
