import { injectGlobal } from 'styled-components'

export default injectGlobal`
:root {
  /* Line Heights */
  --lh-1: 1.125;
  --lh-2: 1.25;
  --lh-3: 1.5;

  /* Multipliers */
  --sm-multiplier: 0.875;
  --md-multiplier: 1;
  --lg-multiplier: 1.125;

  /* Headline Sizes */
  --headline-1: 3.125rem;
  --headline-2: 2.5rem;
  --headline-3: 2.125rem;
  --headline-4: 1.75rem;
  --headline-5: 1.5rem;
  --headline-6: 1.25rem;

  /* Headline Small Sizes */
  --headline-1-sm: calc(var(--headline-1) * var(--sm-multiplier));
  --headline-2-sm: calc(var(--headline-2) * var(--sm-multiplier));
  --headline-3-sm: calc(var(--headline-3) * var(--sm-multiplier));
  --headline-4-sm: calc(var(--headline-4) * var(--sm-multiplier));
  --headline-5-sm: calc(var(--headline-5) * var(--sm-multiplier));
  --headline-6-sm: calc(var(--headline-6) * var(--sm-multiplier));

  /* Headline Medium Sizes */
  --headline-1-md: calc(var(--headline-1) * var(--md-multiplier));
  --headline-2-md: calc(var(--headline-2) * var(--md-multiplier));
  --headline-3-md: calc(var(--headline-3) * var(--md-multiplier));
  --headline-4-md: calc(var(--headline-4) * var(--md-multiplier));
  --headline-5-md: calc(var(--headline-5) * var(--md-multiplier));
  --headline-6-md: calc(var(--headline-6) * var(--md-multiplier));

  /* Headline Large Sizes */
  --headline-1-lg: calc(var(--headline-1) * var(--lg-multiplier));
  --headline-2-lg: calc(var(--headline-2) * var(--lg-multiplier));
  --headline-3-lg: calc(var(--headline-3) * var(--lg-multiplier));
  --headline-4-lg: calc(var(--headline-4) * var(--lg-multiplier));
  --headline-5-lg: calc(var(--headline-5) * var(--lg-multiplier));
  --headline-6-lg: calc(var(--headline-6) * var(--lg-multiplier));
}

h1,
.f1 {
  font-size: var(--headline-1-sm);
}
h2,
.f2 {
  font-size: var(--headline-2-sm);
}
h3,
.f3 {
  font-size: var(--headline-3-sm);
}
h4,
.f4 {
  font-size: var(--headline-4-sm);
}
h5,
.f5 {
  font-size: var(--headline-5-sm);
}
h6,
.f6 {
  font-size: var(--headline-6-sm);
}

h1,
h2,
h3,
h4,
h5,
h6,
.f1,
.f2,
.f3,
.f4,
.f5,
.f6 {
  margin: 0;
  line-height: 1.5;
  line-height: var(--lh-3);
  font-family: inherit;
}

@media only screen and (min-width: 48rem) {
  h1,
  .f1 {
    font-size: var(--headline-1-md);
  }
  h2,
  .f2 {
    font-size: var(--headline-2-md);
  }
  h3,
  .f3 {
    font-size: var(--headline-3-md);
  }
  h4,
  .f4 {
    font-size: var(--headline-4-md);
  }
  h5,
  .f5 {
    font-size: var(--headline-5-md);
  }
  h6,
  .f6 {
    font-size: var(--headline-6-md);
  }
}

@media only screen and (min-width: 57.75rem) {
  h1,
  .f1 {
    font-size: var(--headline-1-lg);
  }
  h2,
  .f2 {
    font-size: var(--headline-2-lg);
  }
  h3,
  .f3 {
    font-size: var(--headline-3-lg);
  }
  h4,
  .f4 {
    font-size: var(--headline-4-lg);
  }
  h5,
  .f5 {
    font-size: var(--headline-5-lg);
  }
  h6,
  .f6 {
    font-size: var(--headline-6-lg);
  }
}

.small {
  font-size: 87.5%;
}
`
