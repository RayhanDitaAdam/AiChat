import React from 'react';
import Avatar from 'boring-avatars';

const UserAvatar = ({ user, size = 40, className = '', square = false }) => {
    // If user has a custom image uploaded, use it
    if (user?.image) {
        return (
            <img
                src={user.image}
                alt={user.name || 'User'}
                className={`object-cover ${square ? 'rounded-lg' : 'rounded-full'} ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    // Otherwise use Boring Avatar
    return (
        <div className={`${square ? 'rounded-lg' : 'rounded-full'} overflow-hidden ${className}`} style={{ width: size, height: size }}>
            <Avatar
                size={size}
                name={user?.name || 'User'}
                variant={user?.avatarVariant || 'beam'}
                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
            />
        </div>
    );
};

export default UserAvatar;
