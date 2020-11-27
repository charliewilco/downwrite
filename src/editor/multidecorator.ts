import Immutable from "immutable";
import { CompositeDecorator, ContentBlock, ContentState } from "draft-js";

var KEY_SEPARATOR = "-";

export class MultiDecorator implements CompositeDecorator {
  public decorators: Immutable.List<CompositeDecorator>;
  constructor(decorators: CompositeDecorator[]) {
    this.decorators = Immutable.List(decorators);
  }

  public getDecorations(block: ContentBlock, contentState: ContentState) {
    var decorations = Array(block.getText().length).fill(null);

    this.decorators.forEach((decorator?: CompositeDecorator, i?: number) => {
      if (!decorator) {
        return;
      }

      var _decorations = decorator.getDecorations(block, contentState);

      _decorations.forEach((key?: string, offset?: number) => {
        if (!key) {
          return;
        }

        key = i + KEY_SEPARATOR + key;

        decorations[offset!] = key;
      });
    });

    return Immutable.List(decorations);
  }

  public getComponentForKey(key: string) {
    var decorator = this.getDecoratorForKey(key);
    return decorator.getComponentForKey(this.getInnerKey(key));
  }

  public getDecoratorForKey(key: string) {
    var parts = key.split(KEY_SEPARATOR);
    var index = Number(parts[0]);

    return this.decorators.get(index);
  }

  private getInnerKey(key: string) {
    var parts = key.split(KEY_SEPARATOR);
    return parts.slice(1).join(KEY_SEPARATOR);
  }

  public getPropsForKey(key: string) {
    var decorator = this.getDecoratorForKey(key);
    return decorator.getPropsForKey(this.getInnerKey(key));
  }
}
