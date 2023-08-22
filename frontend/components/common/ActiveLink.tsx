"use client";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren, useState, useEffect } from "react";

type ActiveLinkProps = LinkProps & {
  altLink?: string;
  className?: string;
  activeClassName: string;
};

const ActiveLink = ({
  children,
  altLink,
  activeClassName,
  className,
  ...props
}: PropsWithChildren<ActiveLinkProps>) => {
  const pathname = usePathname();
  const [computedClassName, setComputedClassName] = useState(className);

  useEffect(() => {
    const linkPathname = new URL(
      (props.as || props.href) as string,
      location.href
    ).pathname;

    // Using URL().pathname to get rid of query and hash
    const activePathname = new URL(pathname, location.href).pathname;

    const newClassName =
      linkPathname?.split("/")[1] === activePathname?.split("/")[1] ||
      (altLink && location.pathname.startsWith(altLink))
        ? `${className} ${activeClassName}`.trim()
        : className;

    if (newClassName !== computedClassName) {
      setComputedClassName(newClassName);
    }
  }, [
    altLink,
    pathname,
    props.as,
    className,
    props.href,
    activeClassName,
    computedClassName,
  ]);

  return (
    <Link className={computedClassName} {...props}>
      {children}
    </Link>
  );
};

export default ActiveLink;
