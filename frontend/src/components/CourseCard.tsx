import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Badge {
    text: string;
    icon?: string;
    className?: string;
}

interface Tag {
    text: string;
    className?: string;
}

interface Provider {
    name: string;
    logo?: string;
    shorthand?: string;
    shorthandBg?: string;
    className?: string;
}

interface CourseCardProps {
    title: string;
    description: string;
    image?: string;
    imageFilter?: string;
    badge?: Badge;
    rating?: number | string;
    metaText?: string;
    metaClassName?: string;
    tag?: Tag;
    provider: Provider;
    price?: string;
    onClick?: (e: React.MouseEvent) => void;
    id?: string | number;
}

const CourseCard = ({
    title,
    description,
    image,
    imageFilter,
    badge,
    rating,
    metaText,
    metaClassName,
    tag,
    provider,
    price,
    onClick,
    id
}: CourseCardProps) => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            onClick(e);
        } else if (id) {
            navigate(`/courses/${id}`);
        }
    };

    return (
        <div onClick={handleClick}
            className="group bg-white rounded-[2rem] p-5 shadow-glow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/10 flex flex-col h-full cursor-pointer">
            <div className={`relative h-44 rounded-2xl ${imageFilter?.includes('gradient') ? 'bg-gray-900' : 'bg-gray-100'} overflow-hidden mb-5`}>
                <div className={`absolute inset-0 ${imageFilter?.includes('gradient') ? '' : 'bg-cover bg-center'} transition-transform duration-700 group-hover:scale-110`}
                    style={imageFilter?.includes('gradient') ? {} : { backgroundImage: `url('${image}')`, filter: imageFilter }}>
                    {imageFilter?.includes('gradient') && (
                        <div className={`absolute inset-0 ${imageFilter} opacity-90 transition-transform duration-700 group-hover:scale-110`}></div>
                    )}
                </div>
                
                {/* Overlay for non-gradient images */}
                {!imageFilter?.includes('gradient') && (
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-300"></div>
                )}

                {/* Badge */}
                {badge && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md z-10 flex items-center gap-1 ${badge.className || 'bg-white/90 backdrop-blur-sm text-primary'}`}>
                        {badge.icon && <span className="material-symbols-outlined text-[12px]">{badge.icon}</span>}
                        {badge.text}
                    </div>
                )}

                {/* Special icon for design/art courses if needed, or make this generic */}
                {imageFilter?.includes('gradient') && (
                     <span className="material-symbols-outlined text-white/20 absolute -right-4 -bottom-4 text-9xl">
                        {title.includes('Design') ? 'brush' : 'data_object'}
                     </span>
                )}
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                    <span className="text-xs font-bold text-[#120f1a]">{rating}</span>
                    <span className="text-xs text-gray-400">•</span>
                    {tag ? (
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${tag.className}`}>
                            {tag.text}
                        </span>
                    ) : (
                        <span className={`text-xs text-gray-500 ${metaClassName || 'font-serif italic'}`}>{metaText}</span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-[#120f1a] mb-2 leading-snug group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
                    {description}
                </p>
            </div>

            <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {provider.logo ? (
                         <div className="size-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                            <img alt="University Logo" className="w-full h-full object-cover" src={provider.logo} />
                         </div>
                    ) : provider.shorthand ? (
                        <div className={`size-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-mono tracking-tighter ${provider.shorthandBg || 'bg-black'}`}>
                            {provider.shorthand}
                        </div>
                    ) : null}
                    <span className={`text-xs font-bold text-gray-700 ${provider.className || 'font-serif'}`}>{provider.name}</span>
                </div>
                {price && <div className="text-[#120f1a] font-bold text-sm">{price}</div>}
            </div>
        </div>
    );
};

export default CourseCard;
