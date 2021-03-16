package com.suse.manager.webui.utils.gson;

import com.redhat.rhn.domain.config.ConfigChannel;
import com.redhat.rhn.domain.org.Org;
import com.redhat.rhn.domain.server.MinionServer;
import com.redhat.rhn.domain.server.ServerGroup;
import com.redhat.rhn.manager.configuration.SaltConfigurable;

public class StateSourceJson {
    private enum Type {
        STATE,
        CONFIG,
        FORMULA,
        INTERNAL
    }

    private enum SourceType {
        SYSTEM,
        GROUP,
        ORG
    }

    private Long id;
    private String name;
    private Type type;
    private Long sourceId;
    private String sourceName;
    private SourceType sourceType;

    private StateSourceJson(Long id, String name, Type type, Long sourceId, String sourceName, SourceType sourceType) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.sourceId = sourceId;
        this.sourceName = sourceName;
        this.sourceType = sourceType;
    }

    private StateSourceJson(ConfigChannel channel, Long sourceId, String sourceName, SourceType sourceType) {
        this(channel.getId(), channel.getDisplayName(), channel.isStateChannel() ? Type.STATE : Type.CONFIG,
                sourceId, sourceName, sourceType);
    }

    public static StateSourceJson internalState() {
        return new StateSourceJson(null, null, Type.INTERNAL, null, null, null);
    }

    public static StateSourceJson originFrom(ConfigChannel channel, SaltConfigurable configurable) {
        if (configurable instanceof MinionServer) {
            MinionServer server = (MinionServer) configurable;
            return new StateSourceJson(channel, server.getId(), server.getName(), SourceType.SYSTEM);
        }
        else if (configurable instanceof ServerGroup) {
            ServerGroup group = (ServerGroup) configurable;
            return new StateSourceJson(channel, group.getId(), group.getName(), SourceType.GROUP);
        }
        else if (configurable instanceof Org) {
            Org org = (Org) configurable;
            return new StateSourceJson(channel, org.getId(), org.getName(), SourceType.ORG);
        }
        else {
            throw new IllegalArgumentException("Invalid state source");
        }
    }

    public static StateSourceJson originFrom(String formulaName, SaltConfigurable configurable) {
        if (configurable instanceof MinionServer) {
            MinionServer server = (MinionServer) configurable;
            return new StateSourceJson(null, formulaName, Type.FORMULA, server.getId(), server.getName(),
                    SourceType.SYSTEM);
        }
        else if (configurable instanceof ServerGroup) {
            ServerGroup group = (ServerGroup) configurable;
            return new StateSourceJson(null, formulaName, Type.FORMULA, group.getId(), group.getName(),
                    SourceType.GROUP);
        }
        else {
            throw new IllegalArgumentException("Invalid formula source");
        }
    }
}
