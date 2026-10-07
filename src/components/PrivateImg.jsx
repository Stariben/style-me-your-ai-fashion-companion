import useSignedUrl from '@/hooks/useSignedUrl';

export default function PrivateImg({ src, alt = '', ...props }) {
  const url = useSignedUrl(src);
  if (!url) return <div className={props.className} />;
  return <img src={url} alt={alt} {...props} />;
}