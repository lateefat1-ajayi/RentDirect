const getInitials = (name = "") => {
  const names = name.trim().split(" ");
  const initials = names.map((n) => n[0]?.toUpperCase()).slice(0, 2);
  return initials.join("");
};

const gradients = [
  "from-primary to-accent",
  "from-success to-primary",
  "from-danger to-accent",
  "from-accent to-success",
];

const getGradient = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const Avatar = ({ name = "", src, imageUrl, size = "w-10 h-10", className = "", isOnline = false, ...props }) => {
  const finalSrc = imageUrl || src;
  return (
    <div className="relative">
      {finalSrc ? (
        <img
          src={finalSrc}
          alt={name}
          className={`rounded-full object-cover ${size} ${className}`}
          {...props}
        />
      ) : (
        <div
          className={`rounded-full bg-gradient-to-br ${getGradient(
            name
          )} text-white font-bold flex items-center justify-center ${size} ${className}`}
          {...props}
        >
          {getInitials(name)}
        </div>
      )}
      
      {/* Online status indicator */}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar;
