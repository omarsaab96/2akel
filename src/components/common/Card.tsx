import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';


interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  childrenClassName?: string;
  hoverable?: boolean;
  noPadding?: boolean;
  titleSubTitleSameLine?: boolean;
  viewAll?: string;
  viewAllLink?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  viewAll,
  viewAllLink,
  children,
  childrenClassName,
  footer,
  titleSubTitleSameLine = false,
  className = '',
  hoverable= false,
  noPadding = false
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${hoverable ? 'transition-shadow duration-200 hover:shadow-lg' : ''}
        ${className}
      `}
    >

      {(title || subtitle || viewAll) && (
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          {(title || subtitle) && (
            <div className={titleSubTitleSameLine? 'flex gap-[10px] items-center':''}>
              {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}

          {viewAll && (
            <div className="text-center">
              <Link to={viewAllLink}>
                <Button variant="ghost" size="sm">
                  {viewAll}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <div className={`${noPadding ? '' : 'p-6'} ${childrenClassName}`}>{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;