/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect } from 'react';

import { makeStyles, Portal, Paper } from '@material-ui/core';

import { useGitTemplate, useGitRepository } from './hooks';
import { ReportIssueTemplateBuilder } from './types';
import {
  PAGE_MAIN_CONTENT_SELECTOR,
  PAGE_FEEDBACK_LINK_SELECTOR,
  ADDON_FEEDBACK_CONTAINER_ID,
  ADDON_FEEDBACK_CONTAINER_SELECTOR,
} from './constants';
import { IssueLink } from './IssueLink';

import {
  useShadowRootElements,
  useShadowRootSelection,
} from '@backstage/plugin-techdocs-react';

const useStyles = makeStyles(theme => ({
  root: {
    transform: 'translate(-100%, -100%)',
    position: 'absolute',
    padding: theme.spacing(1),
    zIndex: theme.zIndex.tooltip,
    background: theme.palette.common.white,
  },
}));

type Style = {
  top: string;
  left: string;
};

/**
 * @public
 */
export type ReportIssueProps = {
  debounceTime?: number;
  templateBuilder?: ReportIssueTemplateBuilder;
};

/**
 * Show report issue button when text is highlighted
 */
export const ReportIssueAddon = ({
  debounceTime = 500,
  templateBuilder: buildTemplate,
}: ReportIssueProps) => {
  const classes = useStyles();
  const [style, setStyle] = useState<Style>();

  const repository = useGitRepository();

  const defaultTemplate = useGitTemplate(debounceTime);

  const selection = useShadowRootSelection(debounceTime);

  const [mainContent, feedbackLink] = useShadowRootElements([
    PAGE_MAIN_CONTENT_SELECTOR,
    PAGE_FEEDBACK_LINK_SELECTOR,
  ]);

  let [feedbackContainer] = useShadowRootElements([
    ADDON_FEEDBACK_CONTAINER_SELECTOR,
  ]);

  if (feedbackLink) {
    feedbackLink.style.display = 'none';
  }

  // calculates the position of the selected text to be able to set the position of the addon
  useEffect(() => {
    if (
      // todo(backstage/techdocs-core) handle non-repo rendering
      !repository ||
      !selection ||
      !selection.containsNode(mainContent!, true) ||
      selection?.containsNode(feedbackContainer!, true)
    ) {
      return;
    }

    const mainContentPosition = mainContent!.getBoundingClientRect();
    const selectionPosition = selection.getRangeAt(0).getBoundingClientRect();

    setStyle({
      top: `${selectionPosition.top - mainContentPosition.top - 16}px`,
      left: `${selectionPosition.left + selectionPosition.width / 2}px`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, mainContent, feedbackContainer]);

  if (!selection || !repository) return null;

  if (!feedbackContainer) {
    feedbackContainer = document.createElement('div');
    feedbackContainer.setAttribute('id', ADDON_FEEDBACK_CONTAINER_ID);
    mainContent!.prepend(feedbackContainer);
  }

  return (
    <Portal container={feedbackContainer}>
      <Paper
        data-testid="report-issue-addon"
        className={classes.root}
        style={style}
      >
        <IssueLink
          repository={repository}
          template={
            buildTemplate ? buildTemplate({ selection }) : defaultTemplate
          }
        />
      </Paper>
    </Portal>
  );
};
