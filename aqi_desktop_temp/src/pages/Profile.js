function Profile() {
    const user = {
        name: "Saina",
        email: "Saina113@gmail.com",
        location: "New York, USA",
        bio: "Software Engineer | Tech Enthusiast | Open Source Contributor",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH3We-azhOdecaVSsDSAWMs7uLgPSNCJwKBRJvEdh1OYXFNSJIs4Jjk-h5uzJMdV_4DH8&usqp=CAU",
        social: {
            github: "https://github.com/Saina",
            linkedin: "https://linkedin.com/in/Saina"
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <img src={user.image} alt={user.name} style={styles.image} />
                <h2 style={styles.name}>{user.name}</h2>
                <p style={styles.bio}>{user.bio}</p>
                <div style={styles.info}>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Location:</strong> {user.location}</p>
                </div>
                <div style={styles.socialLinks}>
                    <a href={user.social.github} target="_blank" rel="noopener noreferrer" style={styles.link}>
                        GitHub
                    </a>
                    <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer" style={styles.link}>
                        LinkedIn
                    </a>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "76vh",
        
    },
    card: {
        background: "#fff",
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "350px",
        width: "100%",
    },
    image: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        objectFit: "cover",
        marginBottom: "15px",
        border: "4px solid #6C63FF", // Stylish border color
    },
    name: {
        fontSize: "24px",
        color: "#333",
        marginBottom: "5px",
    },
    bio: {
        fontSize: "14px",
        color: "#777",
        marginBottom: "15px",
    },
    info: {
        fontSize: "14px",
        color: "#555",
        marginBottom: "15px",
        lineHeight: "1.5",
    },
    socialLinks: {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
    },
    /* Other existing styles */

   
  /* You can add other styles for user-icon, navbar, etc. */
  
    link: {
        textDecoration: "none",
        color: "#6C63FF",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "color 0.3s",
    },
};

export default Profile;
