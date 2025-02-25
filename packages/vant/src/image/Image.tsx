import {
  ref,
  watch,
  computed,
  nextTick,
  onBeforeUnmount,
  defineComponent,
  getCurrentInstance,
  type Slot,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  isDef,
  addUnit,
  inBrowser,
  truthProp,
  numericProp,
  makeStringProp,
  createNamespace,
} from '../utils';

// Components
import { Icon } from '../icon';

const [name, bem] = createNamespace('image');

export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

export type ImagePosition =
  | 'center'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | string;

const imageProps = {
  src: String,
  alt: String,
  fit: String as PropType<ImageFit>,
  position: String as PropType<ImagePosition>,
  round: Boolean,
  width: numericProp,
  height: numericProp,
  radius: numericProp,
  lazyLoad: Boolean,
  iconSize: numericProp,
  showError: truthProp,
  errorIcon: makeStringProp('photo-fail'),
  iconPrefix: String,
  showLoading: truthProp,
  loadingIcon: makeStringProp('photo'),
};

export type ImageProps = ExtractPropTypes<typeof imageProps>;

export default defineComponent({
  name,

  props: imageProps,

  emits: ['load', 'error'],

  setup(props, { emit, slots }) {
    const error = ref(false);
    const loading = ref(true);
    const imageRef = ref<HTMLElement>();

    const { $Lazyload } = getCurrentInstance()!.proxy!;

    const style = computed(() => {
      const style: CSSProperties = {
        width: addUnit(props.width),
        height: addUnit(props.height),
      };

      if (isDef(props.radius)) {
        style.overflow = 'hidden';
        style.borderRadius = addUnit(props.radius);
      }

      return style;
    });

    watch(
      () => props.src,
      () => {
        error.value = false;
        loading.value = true;
      }
    );

    const onLoad = (event?: Event) => {
      loading.value = false;
      emit('load', event);
    };

    const onError = (event?: Event) => {
      error.value = true;
      loading.value = false;
      emit('error', event);
    };

    const renderIcon = (name: string, className: unknown, slot?: Slot) => {
      if (slot) {
        return slot();
      }
      return (
        <Icon
          name={name}
          size={props.iconSize}
          class={className}
          classPrefix={props.iconPrefix}
        />
      );
    };

    const renderPlaceholder = () => {
      if (loading.value && props.showLoading) {
        return (
          <div class={bem('loading')}>
            {renderIcon(props.loadingIcon, bem('loading-icon'), slots.loading)}
          </div>
        );
      }
      if (error.value && props.showError) {
        return (
          <div class={bem('error')}>
            {renderIcon(props.errorIcon, bem('error-icon'), slots.error)}
          </div>
        );
      }
    };

    const renderImage = () => {
      if (error.value || !props.src) {
        return;
      }

      const attrs = {
        alt: props.alt,
        class: bem('img'),
        style: {
          objectFit: props.fit,
          objectPosition: props.position,
        },
      };

      if (props.lazyLoad) {
        return <img ref={imageRef} v-lazy={props.src} {...attrs} />;
      }

      return (
        <img src={props.src} onLoad={onLoad} onError={onError} {...attrs} />
      );
    };

    const onLazyLoaded = ({ el }: { el: HTMLElement }) => {
      const check = () => {
        if (el === imageRef.value && loading.value) {
          onLoad();
        }
      };
      if (imageRef.value) {
        check();
      } else {
        // LazyLoad may trigger loaded event before Image mounted
        // https://github.com/vant-ui/vant/issues/10046
        nextTick(check);
      }
    };

    const onLazyLoadError = ({ el }: { el: HTMLElement }) => {
      if (el === imageRef.value && !error.value) {
        onError();
      }
    };

    if ($Lazyload && inBrowser) {
      $Lazyload.$on('loaded', onLazyLoaded);
      $Lazyload.$on('error', onLazyLoadError);

      onBeforeUnmount(() => {
        $Lazyload.$off('loaded', onLazyLoaded);
        $Lazyload.$off('error', onLazyLoadError);
      });
    }

    return () => (
      <div class={bem({ round: props.round })} style={style.value}>
        {renderImage()}
        {renderPlaceholder()}
        {slots.default?.()}
      </div>
    );
  },
});
